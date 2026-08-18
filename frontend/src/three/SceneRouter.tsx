'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore, effectiveBudget, isRestrained, type SceneId } from '@/store/useSceneStore';
import AtelierScene from './scenes/AtelierScene';
import CuttingScene from './scenes/CuttingScene';
import FormScene from './scenes/FormScene';
import BasketScene from './scenes/BasketScene';
import MuslinScene from './scenes/MuslinScene';
import CameraRig from './CameraRig';
import Effects from './Effects';
import QualityGovernor from './QualityGovernor';

/**
 * Crossfades between atelier scenes inside the persistent canvas.
 *
 * Both the outgoing and incoming scene are mounted at once and a 0..1 weight
 * is eased between them each frame. Nothing here unmounts the canvas or drops
 * the GL context, and no transition costs a React re-render — the weight lives
 * in a ref that scenes read inside their own useFrame.
 *
 * The crossfade is slower than the sister site's on purpose. There, a route
 * change is travel and wants to feel brisk; here it is a change of vantage
 * around one table, and a slow dissolve suits cloth.
 */

function SceneBody({
  scene,
  weightRef,
}: {
  scene: SceneId;
  weightRef: React.MutableRefObject<number>;
}) {
  const tier = useSceneStore((s) => s.tier);
  const effectsSuspended = useSceneStore((s) => s.effectsSuspended);
  const reducedMotion = useSceneStore((s) => s.capabilities?.reducedMotion ?? false);
  const budget = effectiveBudget(tier, scene, { effectsSuspended, reducedMotion });

  if (scene === 'muslin') return null;

  if (isRestrained(scene)) {
    return <MuslinScene scene={scene} weightRef={weightRef} />;
  }

  switch (scene) {
    case 'atelier': return <AtelierScene budget={budget} weightRef={weightRef} />;
    case 'cutting': return <CuttingScene budget={budget} weightRef={weightRef} />;
    case 'form':    return <FormScene    budget={budget} weightRef={weightRef} />;
    case 'basket':  return <BasketScene  budget={budget} weightRef={weightRef} />;
    default:        return null;
  }
}

export default function SceneRouter() {
  const scene = useSceneStore((s) => s.scene);
  const tier = useSceneStore((s) => s.tier);

  const [outgoing, setOutgoing] = useState<SceneId | null>(null);
  const previous = useRef<SceneId>(scene);

  const inWeight = useRef(0);
  const outWeight = useRef(1);

  useEffect(() => {
    if (previous.current === scene) return;
    setOutgoing(previous.current);
    previous.current = scene;
    inWeight.current = 0;
    outWeight.current = 1;
  }, [scene]);

  useFrame((_, delta) => {
    // Normalised against a 60Hz step — a fixed factor would dissolve twice as
    // fast on a 120Hz display.
    const k = 1 - Math.pow(1 - 0.038, Math.min(delta, 0.1) * 60);
    inWeight.current += (1 - inWeight.current) * k;
    outWeight.current += (0 - outWeight.current) * k;
  });

  // Release the outgoing scene's geometry and materials once it is genuinely
  // invisible. Unmounting earlier would cut the dissolve short.
  useEffect(() => {
    if (!outgoing) return;
    const id = setInterval(() => {
      if (outWeight.current < 0.01) {
        setOutgoing(null);
        clearInterval(id);
      }
    }, 120);
    return () => clearInterval(id);
  }, [outgoing]);

  const effectsSuspended = useSceneStore((s) => s.effectsSuspended);
  const reducedMotion = useSceneStore((s) => s.capabilities?.reducedMotion ?? false);
  const budget = effectiveBudget(tier, scene, { effectsSuspended, reducedMotion });

  if (tier === 'off') return null;

  // 'muslin' covers the policy pages, support, and the admin dashboard someone
  // has open all day. Those reach genuinely zero draw calls — the backdrop
  // stays mounted only long enough to dissolve the previous scene away.
  const idle = scene === 'muslin';

  return (
    <>
      <CameraRig />
      <QualityGovernor />

      <SceneBody scene={scene} weightRef={inWeight} />
      {outgoing ? <SceneBody scene={outgoing} weightRef={outWeight} /> : null}

      {idle ? null : <Effects budget={budget} scene={scene} />}
    </>
  );
}
