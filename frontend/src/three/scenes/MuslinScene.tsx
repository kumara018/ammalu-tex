'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneId } from '@/store/useSceneStore';

/**
 * Muslin — checkout, orders, account, returns, sign-in.
 *
 * The restraint here matches what was proved out on the sister site, but the
 * quiet is a different quiet. That one uses a receding floor grid: technical,
 * architectural, drawn in lines. This is a single unbleached calico backdrop —
 * the plain cloth pinned behind a workroom, which is exactly the thing you are
 * meant not to look at.
 *
 * These are the pages people use while spending money or while something has
 * gone wrong, frequently on a phone. So: one surface, no particles, no
 * postprocessing, no physics, no pointer response, and motion slow enough to
 * be below notice. It still renders, because a canvas that blanks between
 * routes is more jarring than one that stays continuous — it simply has
 * nothing to say.
 */

const TONE: Partial<Record<SceneId, string>> = {
  ledger:    '#e2cdc6',
  archive:   '#e2cdc6',
  threshold: '#eeddd8',
};

export default function MuslinScene({
  scene,
  weightRef,
}: {
  scene: SceneId;
  weightRef: MutableRefObject<number>;
}) {
  // Coarse on purpose. The backdrop only needs enough vertices for the fold to
  // read; anything more is fragment cost on a page that should not have any.
  const geometry = useMemo(() => new THREE.PlaneGeometry(30, 18, 12, 8), []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(TONE[scene] ?? '#e2cdc6'),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [scene],
  );

  const mesh = useRef<THREE.Mesh>(null);
  const base = useRef<Float32Array | null>(null);

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((state) => {
    material.opacity = 0.16 * weightRef.current;

    const m = mesh.current;
    if (!m) return;

    const attr = m.geometry.attributes.position as THREE.BufferAttribute;
    // Snapshot the flat positions once — displacing from already-displaced
    // values compounds every frame and the cloth walks off screen.
    if (!base.current) base.current = Float32Array.from(attr.array as Float32Array);

    const t = state.clock.elapsedTime * 0.09;
    for (let i = 0; i < attr.count; i++) {
      const x = base.current[i * 3];
      const y = base.current[i * 3 + 1];
      // A single shallow vertical fold travelling very slowly across the
      // backdrop. One wave, not two — this must never look busy.
      attr.setZ(i, Math.sin(x * 0.22 + t) * 0.28 + Math.sin(y * 0.14 - t * 0.6) * 0.12);
    }
    attr.needsUpdate = true;
  });

  return (
    <mesh ref={mesh} geometry={geometry} material={material} position={[0, 0, -9]} />
  );
}
