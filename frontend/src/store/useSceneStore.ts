'use client';

import { create } from 'zustand';
import type { Capabilities, QualityTier, TierBudget } from '@/three/core/capabilities';
import { TIER_BUDGETS, withoutEffects, forReducedMotion } from '@/three/core/capabilities';
import { isAuthRoute } from '@/lib/routes';

/**
 * Ammalu Tex — the Couture Atelier.
 *
 * The scene vocabulary is a workroom, not a facility. Where the sister site
 * reads as instrumentation — bays, chambers, a vault — this one is a place
 * where things are made by hand: a cutting table, a dress form, a light well.
 * The names are deliberately domestic rather than technical, because that is
 * the register the whole site is meant to sit in.
 */
export type SceneId =
  | 'atelier'    // /             — the workroom, organza in window light
  | 'cutting'    // /products     — pattern pieces on the cutting table
  | 'form'       // /products/[id]— the dress form; the garment itself
  | 'basket'     // /cart, /wishlist — folded, set aside, waiting
  | 'ledger'     // /checkout     — restrained by design
  | 'archive'    // /orders, /account, /returns — restrained
  | 'threshold'  // /auth/*       — restrained
  | 'muslin';    // policy, support, admin — canvas idles entirely

export type TransitionPhase = 'idle' | 'exiting' | 'entering';

interface SceneState {
  capabilities: Capabilities | null;
  tier: QualityTier;
  budget: TierBudget;

  scene: SceneId;
  previousScene: SceneId | null;
  phase: TransitionPhase;

  pointer: { x: number; y: number };
  scroll: number;

  /**
   * Set by the frame-rate governor as its FIRST downgrade step, independently
   * of tier. Postprocessing scales with pixel count rather than scene
   * complexity, so on a high-DPI display it is where the frame budget goes —
   * surrendering the grade buys far more than thinning geometry.
   */
  effectsSuspended: boolean;
  suspendEffects: () => void;

  setCapabilities: (c: Capabilities) => void;
  setTier: (t: QualityTier) => void;
  goToScene: (s: SceneId) => void;
  setPhase: (p: TransitionPhase) => void;
  setPointer: (x: number, y: number) => void;
  setScroll: (v: number) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  capabilities: null,
  tier: 'off',
  budget: TIER_BUDGETS.off,

  scene: 'muslin',
  previousScene: null,
  phase: 'idle',

  pointer: { x: 0, y: 0 },
  scroll: 0,
  effectsSuspended: false,

  suspendEffects: () => set({ effectsSuspended: true }),

  setCapabilities: (c) =>
    set({ capabilities: c, tier: c.tier, budget: TIER_BUDGETS[c.tier] }),

  setTier: (t) => set({ tier: t, budget: TIER_BUDGETS[t] }),

  goToScene: (s) => {
    const { scene } = get();
    if (s === scene) return;
    set({ previousScene: scene, scene: s });
  },

  setPhase: (p) => set({ phase: p }),

  // Written every frame from inside useFrame. A fresh object each time is the
  // cost of Zustand's change detection working correctly, and it is small.
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setScroll: (v) => set({ scroll: v }),
}));

/** Route → scene. Kept beside the store so the two cannot drift. */
export function sceneForPath(pathname: string): SceneId {
  if (pathname === '/') return 'atelier';
  /**
   * THE SCENE IS THE ATELIER, AND NOWHERE ELSE.
   *
   * Every route used to run its own scene, and each drew large pale polygons
   * that slid behind the page. Behind the opening that is atmosphere; behind
   * forty product plates it is a second set of rectangles competing with the
   * merchandise, and on a phone the shapes cut across the cards badly enough
   * to read as a rendering fault.
   *
   * The instinct when a shop asks for something cinematic is to put the cinema
   * everywhere. Every storefront worth copying does the opposite: a film has
   * one title sequence, not one per scene. The spectacle lives on the way in,
   * and the moment a customer is comparing things they might buy, paying, or
   * reading their own records, the background stops asking for attention.
   *
   * `muslin` is the quiet ground and is already in RESTRAINED below, so this
   * also takes the effects budget off every page that is not the homepage —
   * which is most of the time a phone spends on this site.
   */
  return 'muslin';
}

/**
 * Scenes where the effects budget is capped whatever the device can manage.
 *
 * Checkout, the order archive and the sign-in threshold are transactional:
 * every frame of latency on a payment step costs real orders, so they never
 * get the full stack even on hardware that could render it.
 */
const RESTRAINED: ReadonlySet<SceneId> = new Set<SceneId>(['ledger', 'archive', 'threshold', 'muslin']);

export function isRestrained(scene: SceneId): boolean {
  return RESTRAINED.has(scene);
}

/**
 * Scenes carrying the full cinematic chain.
 *
 * The atelier and the dress form are the only two places with a staged subject
 * — cloth hung in the window light, and a garment on the stand. God rays and a
 * shallow focus need something to shine through and focus on; on the cutting
 * table they would be atmosphere applied to nothing, at full full-screen cost.
 */
const HERO: ReadonlySet<SceneId> = new Set<SceneId>(['atelier', 'form']);

export function isHero(scene: SceneId): boolean {
  return HERO.has(scene);
}

/**
 * Effective budget for the active scene.
 *
 * Order matters: restraint cap, then hero gating, then the governor's
 * suspension, then reduced motion. The governor's decision must survive
 * everything below it — it fires only after the device has been measured
 * failing, so no per-scene rule may re-enable what it switched off.
 */
export function effectiveBudget(
  tier: QualityTier,
  scene: SceneId,
  opts: { effectsSuspended?: boolean; reducedMotion?: boolean } = {},
): TierBudget {
  let b = TIER_BUDGETS[tier];

  if (isRestrained(scene)) {
    b = {
      ...b,
      postprocessing: false,
      bloom: false,
      depthOfField: false,
      ssao: false,
      chromaticAberration: false,
      godRays: false,
      lut: false,
      grain: false,
      physics: false,
      shadows: false,
      particles: 0,
      geometryScale: Math.min(b.geometryScale, 0.5),
    };
  } else if (!isHero(scene)) {
    // The cutting table and the basket keep the grade and the grain — what
    // makes the whole site look like one film — but lose the staging passes.
    b = { ...b, godRays: false, depthOfField: false, ssao: false };
  }

  if (opts.effectsSuspended) b = withoutEffects(b);
  if (opts.reducedMotion) b = forReducedMotion(b);
  return b;
}
