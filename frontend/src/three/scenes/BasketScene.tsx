'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TierBudget } from '../core/capabilities';
import { useSceneStore } from '@/store/useSceneStore';

/**
 * Basket — cart and wishlist.
 *
 * A stack of folded cloth, set aside. Nothing in this scene moves under its
 * own power; the only motion is the camera orbiting and the stack settling
 * fractionally, as a pile does when something is added to it.
 *
 * The register is "put aside for you", which is why it is a stack rather than
 * a container: a stack is finite and countable, and a customer on this page is
 * counting.
 */
export default function BasketScene({
  budget,
  weightRef,
}: {
  budget: TierBudget;
  weightRef: MutableRefObject<number>;
}) {
  const layers = Math.max(4, Math.round(9 * budget.geometryScale));

  const folds = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => ({
        y: i * 0.19,
        // Folded cloth never stacks square — each layer sits slightly off.
        offsetX: Math.sin(i * 2.4) * 0.12,
        offsetZ: Math.cos(i * 1.7) * 0.1,
        rot: Math.sin(i * 3.1) * 0.09,
        // Alternating warm/cool through the stack so layers stay countable.
        tone: i % 3,
        width: 2.5 - i * 0.06,
        depth: 1.7 - i * 0.04,
      })),
    [layers],
  );

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 0.16, 1), []);

  const materials = useMemo(
    () =>
      ['#c2a29a', '#e2cdc6', '#d59d89'].map(
        (c) =>
          new THREE.MeshStandardMaterial({
            color: c,
            roughness: 0.88,
            metalness: 0.02,
            transparent: true,
            opacity: 0,
          }),
      ),
    [],
  );

  const stack = useRef<THREE.Group>(null);

  useEffect(() => () => { geometry.dispose(); materials.forEach((m) => m.dispose()); },
    [geometry, materials]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const w = weightRef.current;
    for (const m of materials) m.opacity = 0.8 * w;

    // One very slow breath for the whole stack — barely perceptible, and
    // deliberately the least eventful scene on the site.
    if (stack.current) {
      stack.current.position.y = -1.1 + Math.sin(t * 0.22) * 0.015;
    }
  });

  return (
    <group ref={stack}>
      {folds.map((f, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={materials[f.tone]}
          position={[f.offsetX, f.y, f.offsetZ]}
          rotation={[0, f.rot, 0]}
          scale={[f.width, 1, f.depth]}
          castShadow={budget.shadows}
        />
      ))}
      <ambientLight intensity={0.6} color="#f6ece9" />
      <directionalLight position={[-4, 5, -3]} intensity={0.95} color="#f1dcd2" />
    </group>
  );
}
