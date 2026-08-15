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

  // Pattern paper: matte, warm, almost no specular. It must not look like
  // fabric — the contrast with the organza elsewhere is the point.
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e3bcac',
        roughness: 0.95,
        metalness: 0,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { scroll } = useSceneStore.getState();
    material.opacity = 0.5 * weightRef.current;

    for (let i = 0; i < meshes.current.length; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      const p = pieces[i];

      /**
       * Settling motion: a decaying oscillation rather than a continuous
       * drift. Each piece "lands", overshoots slightly, and comes to rest,
       * then repeats on a long cycle. The sister site's equivalent never
       * stops moving; this one is still most of the time, which is what makes
       * it read as a table rather than a conveyor.
       */
      const cycle = (t * 0.18 + p.phase) % (Math.PI * 2);
      const settle = Math.exp(-cycle * 1.6) * Math.sin(cycle * 5.0);

      m.position.set(p.x, settle * 0.06, p.z + scroll * 6.0);
      m.rotation.z = p.rot + settle * 0.05;
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
          material={material}
          scale={p.scale}
        />
      ))}
      <ambientLight intensity={0.75} color="#faf0ec" />
      <directionalLight position={[-4, 6, 2]} intensity={0.7} color="#f1dcd2" />
    </group>
  );
}
