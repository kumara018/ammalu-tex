'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createOrganzaMaterial } from '../materials/organza';
import type { TierBudget } from '../core/capabilities';
import { useSceneStore } from '@/store/useSceneStore';

/**
 * Form — the product detail page.
 *
 * A dress form with sheer cloth draped over it. This is the one scene with a
 * literal subject, and the camera comes down to eye level with it.
 *
 * The form itself is a lathe: a real silhouette revolved, not a cylinder. The
 * profile matters — a mannequin's shoulder/waist/hip curve is instantly
 * recognisable, and a stand-in primitive would read as a vase.
 *
 * Spline content for this route, if authored, mounts at the DOM layer via
 * <SplineSurface sceneKey="form" /> — see three/spline/SplineSurface.tsx for
 * why it cannot live inside this canvas.
 */

/** Half-profile of a dress form, bottom to top, in metres. */
const PROFILE: [number, number][] = [
  [0.00, -2.40], [0.34, -2.36], [0.40, -2.20],  // stand base
  [0.09, -2.10], [0.09, -1.30],                 // post
  [0.62, -1.16], [0.82, -0.86],                 // hip flare
  [0.86, -0.52], [0.74, -0.12],                 // waist in
  [0.80,  0.30], [0.86,  0.62],                 // bust
  [0.70,  0.96], [0.46,  1.18],                 // shoulder
  [0.22,  1.26], [0.00,  1.28],                 // neck
];

export default function FormScene({
  budget,
  weightRef,
}: {
  budget: TierBudget;
  weightRef: MutableRefObject<number>;
}) {
  const radial = Math.max(12, Math.round(48 * budget.geometryScale));
  const seg = Math.max(14, Math.round(40 * budget.geometryScale));

  const formGeo = useMemo(
    () => new THREE.LatheGeometry(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), radial),
    [radial],
  );

  // Calico: the undyed cotton a real form is covered in. Matte, pale, and
  // deliberately duller than anything draped over it.
  const formMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e2cdc6',
        roughness: 0.9,
        metalness: 0.02,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  // Two drape panels at different densities, so the overlap over the form
  // reads as gathered cloth.
  const drapeGeo = useMemo(() => new THREE.PlaneGeometry(3.2, 4.6, seg, seg), [seg]);
  const drapeMats = useMemo(
    () => [
      createOrganzaMaterial({ tint: '#6f544c', glow: '#f1dcd2', density: 0.44, breath: 0.24, opacity: 0 }),
      createOrganzaMaterial({ tint: '#4f3a33', glow: '#e3bcac', density: 0.62, breath: 0.18, opacity: 0 }),
    ],
    [],
  );

  const form = useRef<THREE.Group>(null);

  useEffect(() => () => { formGeo.dispose(); formMat.dispose(); }, [formGeo, formMat]);
  useEffect(() => () => { drapeGeo.dispose(); drapeMats.forEach((m) => m.dispose()); }, [drapeGeo, drapeMats]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { pointer } = useSceneStore.getState();
    const w = weightRef.current;

    /**
     * WHY THESE NUMBERS CAME DOWN FROM 0.92 AND 0.85.
     *
     * The form was rendering at 92% opacity across the whole viewport, behind
     * a page whose right-hand column is the product name, the price, the size
     * and the colour. A near-opaque calico torso the height of the screen sat
     * directly under all of it, so the headline was set on a moving surface
     * and the price washed out wherever the shoulder passed behind it.
     *
     * That is not a lighting problem, it is a priority problem: on THIS route
     * the garment being sold is the photograph in the gallery, and the form is
     * the room it is being shown in. A room does not compete with the thing on
     * the stand.
     *
     * So the form and its drape drop to a weight where copy stays black on
     * paper, and the whole group moves left (below) so its mass sits behind
     * the gallery — which is opaque — rather than behind the type.
     */
    formMat.opacity = 0.11 * w;
    drapeMats.forEach((m, i) => {
      m.uniforms.uTime.value = t + i * 5.1;
      m.uniforms.uOpacity.value = 0.15 * w;
      // Moving the light rather than the cloth. On a transmissive material the
      // informative interaction is watching the glow travel *through* the
      // fabric as the source shifts — the opposite of the sister site, where
      // the pointer moves a reflected highlight across the surface.
      m.uniforms.uLightDir.value
        .set(-0.55 + pointer.x * 0.5, 0.35 + pointer.y * 0.3, -0.75)
        .normalize();
    });

    if (form.current) {
      // A quarter-turn sway, not a rotation. A garment on a form is looked at,
      // not spun — continuous rotation makes a hem impossible to read.
      form.current.rotation.y = Math.sin(t * 0.12) * 0.3 + pointer.x * 0.18;
      // Off to the left, behind the gallery. The copy column is to the right
      // of centre on every width this route uses, and nothing that moves
      // belongs underneath a price.
      form.current.position.x = -2.6;
    }
  });

  return (
    <group ref={form}>
      <mesh geometry={formGeo} material={formMat} castShadow={budget.shadows} />

      <mesh geometry={drapeGeo} material={drapeMats[0]} position={[0.1, -0.15, 0.95]} rotation={[0, 0.08, 0.04]} renderOrder={2} />
      <mesh geometry={drapeGeo} material={drapeMats[1]} position={[-0.15, -0.3, -0.9]} rotation={[0, -0.12, -0.03]} renderOrder={1} />

      <ambientLight intensity={0.45} color="#f6ece9" />
      <directionalLight position={[-5, 2.5, -5]} intensity={1.35} color="#f1dcd2" castShadow={budget.shadows} />
      {/* Weak fill from the room side so the shadowed half is not dead. */}
      <pointLight position={[4, 1, 4]} intensity={0.35} color="#c1876f" />
    </group>
  );
}
