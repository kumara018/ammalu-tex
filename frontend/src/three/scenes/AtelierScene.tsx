'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createOrganzaMaterial } from '../materials/organza';
import type { TierBudget } from '../core/capabilities';
import { useSceneStore } from '@/store/useSceneStore';

/**
 * Atelier — the homepage.
 *
 * Sheer panels hung across a window, layered so the overlaps darken into real
 * cloth. There is one light source, low and to the left, and everything in the
 * scene is either transmitting it or blocking it.
 *
 * The composition is intentionally asymmetric and off-centre: a workroom is
 * not arranged, it accumulates. The sister site's homepage is three balanced
 * banners; this is six panels of different sizes clustered toward the window
 * with empty space on the other side.
 */

const PANELS = [
  { x: -3.9, y:  0.7, z: -2.2, w: 2.4, h: 5.4, rot:  0.10, density: 0.42, breath: 0.34 },
  { x: -2.5, y: -0.2, z: -3.1, w: 3.0, h: 6.0, rot: -0.14, density: 0.5,  breath: 0.28 },
  { x: -0.7, y:  0.4, z: -4.0, w: 2.6, h: 5.2, rot:  0.06, density: 0.6,  breath: 0.22 },
  { x:  1.1, y: -0.4, z: -4.8, w: 3.4, h: 5.8, rot: -0.08, density: 0.68, breath: 0.18 },
  { x:  3.0, y:  0.5, z: -5.6, w: 2.2, h: 4.6, rot:  0.16, density: 0.8,  breath: 0.14 },
  { x:  4.4, y: -0.1, z: -6.6, w: 2.8, h: 5.0, rot: -0.05, density: 0.95, breath: 0.10 },
];

export default function AtelierScene({
  budget,
  weightRef,
}: {
  budget: TierBudget;
  weightRef: MutableRefObject<number>;
}) {
  // Organza's displacement is per-vertex, so segments are exactly where a weak
  // GPU should give ground. Below ~8 the breathing visibly facets.
  const seg = Math.max(8, Math.round(22 * budget.geometryScale));

  // Panels furthest from the window are the densest — light has less to give
  // by the time it reaches them.
  const materials = useMemo(
    () =>
      PANELS.map((p) =>
        createOrganzaMaterial({
          tint: '#4f3a33',   // maroon-700, the deep taupe of the brand
          glow: '#f1dcd2',   // gold-100 — warm daylight through cloth
          density: p.density,
          breath: p.breath,
          opacity: 0,
        }),
      ),
    [],
  );

  const geometries = useMemo(
    () => PANELS.map((p) => new THREE.PlaneGeometry(p.w, p.h, seg, seg)),
    [seg],
  );

  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { pointer } = useSceneStore.getState();
    const w = weightRef.current;

    for (let i = 0; i < materials.length; i++) {
      const u = materials[i].uniforms;
      // Each panel runs on its own slightly offset clock so the layers never
      // breathe in unison — synchronised cloth reads as a single object.
      u.uTime.value = t + i * 3.7;
      u.uOpacity.value = 0.7 * w;
    }

    if (group.current) {
      // The cluster sways as one, very slightly, against the pointer. Less
      // than the camera's own sway, so it reads as depth rather than as the
      // cloth chasing the cursor.
      group.current.rotation.y += (pointer.x * 0.03 - group.current.rotation.y) * 0.015;
    }
  });

  return (
    <group ref={group}>
      {PANELS.map((p, i) => (
        <mesh
          key={i}
          geometry={geometries[i]}
          material={materials[i]}
          position={[p.x, p.y, p.z]}
          rotation={[0, p.rot, 0]}
          // Sheer layers must composite back-to-front to accumulate correctly;
          // sorting by depth explicitly avoids the ordering flicker that
          // transparent planes get when the camera orbits past them.
          renderOrder={PANELS.length - i}
        />
      ))}
      <ambientLight intensity={0.4} color="#f6ece9" />
      <directionalLight position={[-5, 3, -6]} intensity={1.2} color="#f1dcd2" />
    </group>
  );
}
