'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  EffectComposer, Bloom, DepthOfField, N8AO, ChromaticAberration,
  Vignette, SMAA, Noise, GodRays, LUT,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { useLoader } from '@react-three/fiber';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader.js';
import { Vector2, Mesh } from 'three';
import type { TierBudget } from './core/capabilities';
import type { SceneId } from '@/store/useSceneStore';

/**
 * The cinematic chain.
 *
 * Staged the way a product film is staged rather than the way a game is
 * post-processed: one dramatic key, a shallow focus locked to the subject,
 * shafts through the fabric, and a print grade over everything. The reference
 * is hardware-product staging — a single hero object, lit hard, turning slowly,
 * with the background falling away — not a corporate site's editorial grid,
 * which governs the typography here but has nothing to say about the hero.
 *
 * Pass order is not arbitrary. Optical effects that a real lens would produce
 * (DoF, god rays, bloom, aberration) run first, because they describe what
 * reaches the film. Grade and grain run last, because they describe the film
 * itself. Putting the LUT before bloom would grade the scene and then add
 * ungraded light on top, which is exactly how a render ends up looking like
 * two images stacked.
 */

/** Per-scene focus and stage tuning. Defaults are never shipped as-is. */
interface StageTuning {
  focusDistance: number;
  focalLength: number;
  bokehScale: number;
  bloomThreshold: number;
  bloomIntensity: number;
  /** Where the key light sits, for the god-ray source. */
  sun: [number, number, number];
  sunSize: number;
  raysDensity: number;
  raysDecay: number;
  vignette: number;
}

const STAGE: Record<string, StageTuning> = {
  /**
   * Atelier. The key is the window — low, to the left and behind the hung
   * panels, matching the organza shader's own uLightDir exactly. That
   * agreement is the whole point: the shafts have to leave the same place the
   * cloth is being lit from, or the scene reads as two unrelated light rigs.
   *
   * The rays are softer and wider than the sister site's: this is daylight
   * through a window and fabric, not a spot through a haze machine, so density
   * is lower and decay faster so shafts fade instead of driving to the edge.
   */
  atelier: {
    focusDistance: 0.012, focalLength: 0.030, bokehScale: 5.0,
    bloomThreshold: 1.06, bloomIntensity: 0.50,
    sun: [-6.2, 3.6, -7.0], sunSize: 1.5,
    raysDensity: 0.86, raysDecay: 0.955,
    vignette: 0.42,
  },
  /**
   * Form. The garment on the stand — the shot that has to sell the cloth, so
   * the drape is sharp and the room falls away hard. Slightly warmer bloom
   * threshold than the atelier because the fill light picks out the gold.
   */
  form: {
    focusDistance: 0.005, focalLength: 0.022, bokehScale: 6.5,
    bloomThreshold: 0.98, bloomIntensity: 0.68,
    sun: [-5.4, 2.6, -5.6], sunSize: 1.1,
    raysDensity: 0.90, raysDecay: 0.945,
    vignette: 0.50,
  },
  // Cutting table and basket: graded and grainy like everything else, but no
  // staging — a flat table of pattern pieces has no single subject to throw
  // light through or focus on.
  default: {
    focusDistance: 0.022, focalLength: 0.055, bokehScale: 2.0,
    bloomThreshold: 1.14, bloomIntensity: 0.38,
    sun: [-4, 3, -6], sunSize: 0.8,
    raysDensity: 0.86, raysDecay: 0.94,
    vignette: 0.30,
  },
};

/** The god-ray source. Never visible itself — only what it occludes matters. */
function KeyLight({ tuning, onReady }: { tuning: StageTuning; onReady: (m: Mesh | null) => void }) {
  const ref = useRef<Mesh>(null);
  useEffect(() => {
    onReady(ref.current);
    return () => onReady(null);
  }, [onReady]);

  return (
    <mesh ref={ref} position={tuning.sun}>
      <sphereGeometry args={[tuning.sunSize, 20, 20]} />
      {/* Unlit and fog-immune: this is a light *source*, so it must not be
          shaded by the scene it is lighting. */}
      {/* Warm and dimmer than the sister site's — window daylight filtered
          through cloth, not a studio key. */}
      <meshBasicMaterial color="#f7e6d6" transparent opacity={0.72} fog={false} />
    </mesh>
  );
}

/**
 * The composer and its passes.
 *
 * Split out so the LUT's useLoader suspends *this* component, letting a single
 * Suspense boundary sit outside the whole composer. Wrapping an individual
 * effect in Suspense instead would put a non-effect node in the composer's
 * child list, which is what it walks to build its pass chain.
 *
 * The LUT is always loaded even when budget.lut is false — hooks cannot be
 * conditional, and it is a 130KB fetch that the browser caches, so the cost of
 * loading it unused is far lower than the cost of a hook-order violation.
 */
function Composer({ budget, tuning, sun }: { budget: TierBudget; tuning: StageTuning; sun: Mesh | null }) {
  const caOffset = useMemo(() => new Vector2(0.0005, 0.0003), []);
  // Authored print emulation: lifted cool toe, filmic S-curve, warm shoulder,
  // chroma falloff at both extremes.
  const lut = useLoader(LUTCubeLoader, '/luts/film-print.cube');
  const wantsRays = budget.godRays && !!sun;

  return (
      <EffectComposer enableNormalPass={budget.ssao} multisampling={0}>
        {/* Post-resolve, so hardware MSAA no longer applies — SMAA is a single
            cheap pass and the only anti-aliasing available at this point. */}
        <SMAA />

        {budget.ssao ? (
          <N8AO aoRadius={1.6} intensity={2.0} distanceFalloff={0.8} halfRes />
        ) : <></>}

        {/* ── Optics: what the lens does ─────────────────────────────── */}
        {wantsRays ? (
          <GodRays
            sun={sun as Mesh}
            density={tuning.raysDensity}
            decay={tuning.raysDecay}
            weight={0.42}
            exposure={0.28}
            samples={48}
            blur
            kernelSize={KernelSize.SMALL}
          />
        ) : <></>}

        {budget.depthOfField ? (
          <DepthOfField
            focusDistance={tuning.focusDistance}
            focalLength={tuning.focalLength}
            bokehScale={tuning.bokehScale}
          />
        ) : <></>}

        {budget.bloom ? (
          <Bloom
            // Above 1.0 so only genuine speculars and the gold accents bleed.
            // Drop this below 1 and the whole frame hazes, which reads as a
            // rendering fault rather than as light.
            luminanceThreshold={tuning.bloomThreshold}
            luminanceSmoothing={0.32}
            intensity={tuning.bloomIntensity}
            mipmapBlur
          />
        ) : <></>}

        {budget.chromaticAberration ? <ChromaticAberration offset={caOffset} /> : <></>}

        {/* ── The film itself: grade, then grain, then the frame edge ─── */}
        {budget.lut ? <LUT lut={lut.texture3D} /> : <></>}

        {budget.grain ? (
          // Low enough to be felt rather than seen. This is the single
          // cheapest thing that stops the image reading as sterile digital.
          <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.055} />
        ) : <></>}

        <Vignette offset={0.3} darkness={tuning.vignette} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
  );
}

export default function Effects({
  budget,
  scene,
}: {
  budget: TierBudget;
  scene: SceneId;
}) {
  const tuning = STAGE[scene] ?? STAGE.default;
  const [sun, setSun] = useState<Mesh | null>(null);

  // No composer at all when the chain is off. An EffectComposer with an empty
  // pass list still allocates render targets and still costs a full-frame copy
  // every frame, so "no effects" has to mean no composer — this is exactly what
  // the governor's first downgrade step relies on.
  if (!budget.postprocessing) return null;

  return (
    <>
      {budget.godRays ? <KeyLight tuning={tuning} onReady={setSun} /> : null}
      {/* Falls back to an ungraded frame for the moment the LUT is in flight,
          rather than blanking the scene. */}
      <Suspense fallback={null}>
        <Composer budget={budget} tuning={tuning} sun={sun} />
      </Suspense>
    </>
  );
}
