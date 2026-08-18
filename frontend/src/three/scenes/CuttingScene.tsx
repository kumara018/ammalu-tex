'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TierBudget } from '../core/capabilities';
import { useSceneStore } from '@/store/useSceneStore';

/**
 * Cutting — the product listing.
 *
 * Paper pattern pieces laid out flat on the table, seen from above. The
 * camera station for this scene looks down, so the scene is composed in plan:
 * shapes on a surface, not objects in a space.
 *
 * The sister site's listing is a receding rack — depth, parallax, motion into
 * the screen. This one has almost no depth at all. Everything sits within a
 * few centimetres of one plane, and the interest comes from *arrangement*:
 * irregular shapes at irregular angles, the way a cutter actually nests
 * pieces to waste as little cloth as possible.
 *
 * Motion is placement, not drift. A piece slides a little, then stops.
 */

/** Pattern shapes, cut as irregular polygons rather than rectangles. */
function patternShape(kind: number): THREE.Shape {
  const s = new THREE.Shape();
  switch (kind % 4) {
    case 0: // bodice front — curved armhole
      s.moveTo(-0.6, -0.9);
      s.lineTo(0.6, -0.9);
      s.lineTo(0.55, 0.5);
      s.quadraticCurveTo(0.3, 0.95, -0.1, 0.9);
      s.lineTo(-0.6, 0.6);
      break;
    case 1: // sleeve — the classic bell
      s.moveTo(-0.75, -0.5);
      s.quadraticCurveTo(0, -0.75, 0.75, -0.5);
      s.lineTo(0.45, 0.7);
      s.quadraticCurveTo(0, 0.95, -0.45, 0.7);
      break;
    case 2: // skirt panel — a tapered wedge
      s.moveTo(-0.35, 1.0);
      s.lineTo(0.35, 1.0);
      s.lineTo(0.8, -1.0);
      s.lineTo(-0.8, -1.0);
      break;
    default: // facing strip
      s.moveTo(-0.9, -0.22);
      s.lineTo(0.9, -0.22);
      s.lineTo(0.9, 0.22);
      s.lineTo(-0.9, 0.22);
  }
  s.closePath();
  return s;
}

const COUNT = 14;

export default function CuttingScene({
  budget,
  weightRef,
}: {
  budget: TierBudget;
  weightRef: MutableRefObject<number>;
}) {
  const count = Math.max(6, Math.round(COUNT * budget.geometryScale));

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        kind: i,
        x: ((i * 2.9) % 9) - 4.5 + (i % 3) * 0.4,
        z: (Math.floor(i / 3) * 2.2) - 3.4,
        rot: (i * 1.31) % (Math.PI * 2),
        scale: 0.8 + ((i * 37) % 40) / 100,
        // Each piece settles on its own schedule, so the table never animates
        // as a block.
        phase: (i * 0.83) % (Math.PI * 2),
      })),
    [count],
  );

  const geometries = useMemo(
    () => pieces.map((p) => new THREE.ShapeGeometry(patternShape(p.kind))),
    [pieces],
  );

  /**
   * ONE MATERIAL PER PIECE, AND THAT IS THE WHOLE FIX.
   *
   * Every piece used to share a single material at `opacity 0.5`. Fourteen
   * identical stencils at the same weight, on a paper ground, behind live
   * copy — so the listing read as flat brown shapes lying ON TOP of the
   * headline rather than a table lying behind it. Half-opacity is not
   * atmosphere, it is a sticker.
   *
   * Depth is what was missing, and depth in a real image is carried by
   * CONTRAST, not by position: things further away are fainter and cooler.
   * A shared material cannot express that, because opacity and colour are
   * properties of the material, not the mesh. Fourteen materials is fourteen
   * uniform uploads a frame on a scene with no postprocessing — free — and it
   * buys per-piece aerial perspective, which is the difference between a
   * pattern and a photograph.
   */
  const materials = useMemo(
    () =>
      pieces.map(() =>
        new THREE.MeshStandardMaterial({
          color: '#e3bcac',
          roughness: 0.95,
          metalness: 0,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          // The pieces overlap by design. Without this they sort against each
          // other and edges pop as they settle.
          depthWrite: false,
        }),
      ),
    [pieces],
  );

  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  /** Scratch colours, so the loop allocates nothing per frame. */
  const near = useMemo(() => new THREE.Color('#d9b3a2'), []);
  const far = useMemo(() => new THREE.Color('#ecdcd4'), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { scroll } = useSceneStore.getState();
    const w = weightRef.current;

    /**
     * The light sweep.
     *
     * A cutting table is lit from a strip overhead, and the one thing that
     * makes a still surface cinematic rather than static is light moving
     * across it. So a soft band travels down the table on a ~28s cycle,
     * lifting each piece as it passes and letting it fall back. It is one
     * gaussian per piece per frame — no postprocessing, no extra draw call,
     * and it is the only thing on this page that moves at all once the
     * pieces have settled.
     */
    const sweep = ((t * 0.036) % 1.5) - 0.25;

    for (let i = 0; i < meshes.current.length; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      const p = pieces[i];
      const mat = materials[i];

      /**
       * Settling motion: a decaying oscillation rather than a continuous
       * drift. Each piece "lands", overshoots slightly, and comes to rest,
       * then repeats on a long cycle. The sister site's equivalent never
       * stops moving; this one is still most of the time, which is what makes
       * it read as a table rather than a conveyor.
       */
      const cycle = (t * 0.18 + p.phase) % (Math.PI * 2);
      const settle = Math.exp(-cycle * 1.6) * Math.sin(cycle * 5.0);

      // Pieces parallax against each other by depth — the far row travels
      // less than the near one, which is what separates them into layers.
      const layer = 0.72 + 0.5 * ((i % 3) / 2);
      const z = p.z + scroll * 6.0 * layer;

      m.position.set(p.x, settle * 0.06, z);
      m.rotation.z = p.rot + settle * 0.05;

      /**
       * Where this piece sits up the frame, 0 at the top edge and 1 at the
       * bottom. The masthead and the standfirst live in the top third, so
       * that is where the table has to disappear: a headline competing with
       * a shape is the exact complaint this scene earned.
       */
      const up = THREE.MathUtils.clamp((z + 4.2) / 8.4, 0, 1);
      const band = up * up;                       // strongest along the bottom
      const d = up - sweep;
      const lit = Math.exp(-(d * d) / 0.014);     // the passing light

      mat.opacity = (0.035 + 0.105 * band + 0.11 * lit) * w;
      // Aerial perspective: the far pieces are paler and cooler, the near
      // ones warmer and denser. Same idea as the opacity ramp, in hue.
      scratch.copy(far).lerp(near, band * 0.85 + lit * 0.15);
      mat.color.copy(scratch);
    }

    if (group.current) group.current.position.y = -1.2;
  });

  return (
    <group ref={group} rotation={[-Math.PI / 2 + 0.12, 0, 0]}>
      {pieces.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshes.current[i] = el; }}
          geometry={geometries[i]}
          material={materials[i]}
          scale={p.scale}
        />
      ))}
      <ambientLight intensity={0.75} color="#faf0ec" />
      <directionalLight position={[-4, 6, 2]} intensity={0.7} color="#f1dcd2" />
    </group>
  );
}
