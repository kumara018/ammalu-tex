'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { detectCapabilities } from './core/capabilities';
import { useSceneStore, sceneForPath } from '@/store/useSceneStore';
import { registerScroller, scrollPageTo, shouldPreventSmoothing, isHistoryNavigation } from '@/lib/smoothScroll';

/**
 * The canvas is client-only: R3F touches window/document at import time, and
 * SSR-ing it would both fail and ship the whole three.js bundle into the
 * server payload. ssr:false keeps it out of the critical path entirely.
 */
const CanvasHost = dynamic(() => import('./CanvasHost'), { ssr: false });

/** Scene graph is loaded separately so the canvas can mount before it. */
const SceneRouter = dynamic(() => import('./SceneRouter'), { ssr: false });

/**
 * Mounts once at the root layout and stays mounted for the life of the tab.
 *
 * Owns three things:
 *   1. capability detection (once, on mount)
 *   2. route → scene mapping, so navigation animates the existing scene
 *      instead of tearing the canvas down
 *   3. Lenis smooth scroll, driven on the same clock as GSAP
 */
export default function ThreeProvider() {
  const pathname = usePathname();
  /* The one route that draws. Kept beside `sceneForPath` in spirit: if a
     second scene ever returns, this is the single line that has to change. */
  /* Ask the route map rather than restating its rule. The sister repo kept a
     second copy of this and the two disagreed: the map said "no scene" and the
     canvas mounted anyway, because this line had never heard about it. */
  const showsScene = sceneForPath(pathname) !== 'muslin';
  const setCapabilities = useSceneStore((s) => s.setCapabilities);
  const goToScene = useSceneStore((s) => s.goToScene);
  const capabilities = useSceneStore((s) => s.capabilities);

  /**
   * ON A PHONE THE SCENE IS NOT WORTH ITS WEIGHT, SO IT IS NOT LOADED.
   *
   * Gating the canvas to the homepage took every other route from 730KB of
   * JavaScript to about 320KB. The homepage still paid the full 717KB of
   * three.js, and that is the page the shop most needs to be fast — it is
   * where a customer decides whether to stay.
   *
   * The trade is easy once it is stated plainly. On a phone on mobile data,
   * three quarters of a megabyte buys an atmospheric background BEHIND the
   * products somebody came to look at, and costs seconds of a locked main
   * thread before the page answers a tap. On a laptop on wifi the same code is
   * a rounding error and the room is worth having. So it loads on a wide
   * screen with memory to spare, and nowhere else.
   *
   *   `< 1024px`  — phones and small tablets, where the complaint came from
   *   `<= 4GB`    — the mid-range Android this shop's customers actually hold
   *   reducedMotion — already honoured everywhere else; honoured here too
   *
   * And even then it waits for an idle moment, so the products and the
   * Add-to-bag buttons are interactive BEFORE a single byte of 3D is fetched.
   * The scene is the last thing to arrive, which is the correct order of
   * priorities and the opposite of what was happening.
   */
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!showsScene) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setIdle(true), { timeout: 2500 });
      return () => (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setIdle(true), 1200);
    return () => clearTimeout(t);
  }, [showsScene]);

  const bigEnough =
    typeof window !== 'undefined' && window.innerWidth >= 1024;
  const sceneWorthLoading =
    idle &&
    bigEnough &&
    !!capabilities &&
    !capabilities.reducedMotion &&
    (capabilities.deviceMemoryGb === null || capabilities.deviceMemoryGb > 4);


  // ── Capability detection, exactly once ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    detectCapabilities().then((caps) => {
      if (!cancelled) setCapabilities(caps);
    });
    return () => { cancelled = true; };
  }, [setCapabilities]);

  // ── Route → scene ───────────────────────────────────────────────────
  useEffect(() => {
    goToScene(sceneForPath(pathname));
  }, [pathname, goToScene]);

  // ── Lenis + GSAP on one clock ───────────────────────────────────────
  useEffect(() => {
    if (!capabilities) return;
    // Honouring the OS preference beats any smooth-scroll nicety.
    if (capabilities.reducedMotion) return;

    let lenis: import('lenis').default | null = null;
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      // `prevent` is what lets a scrollable panel inside the page keep its own
      // wheel events — without it Lenis calls preventDefault() on every wheel
      // anywhere, and a dialog can only be scrolled by dragging its scrollbar.
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, prevent: shouldPreventSmoothing });

      // Published so that anything needing to move the page can go through
      // Lenis rather than fighting it with window.scrollTo.
      registerScroller(lenis);

      // ScrollTrigger must be told about Lenis's virtual scroll position, and
      // Lenis must be driven by GSAP's ticker rather than its own rAF — two
      // independent loops drift by a frame and the scene visibly judders
      // against the DOM.
      lenis.on('scroll', ScrollTrigger.update);

      const tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Publish scroll progress for scenes to read.
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        useSceneStore.getState().setScroll(max > 0 ? window.scrollY / max : 0);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      cleanup = () => {
        window.removeEventListener('scroll', onScroll);
        gsap.ticker.remove(tick);
        registerScroller(null);
        lenis?.destroy();
        lenis = null;
      };
    })();

    return () => { cancelled = true; cleanup(); };
  }, [capabilities]);

  // Route changes reset the scroll position — Lenis keeps its own virtual
  // offset, which otherwise survives a navigation and lands you mid-page.
  //
  // scrollPageTo, not window.scrollTo({behavior:'smooth'}): a native SMOOTH
  // scroll does not move the page at all while Lenis is running, because Lenis
  // overwrites the position every frame for the whole animation. See the note
  // in lib/smoothScroll.ts — it was measured, not assumed.
  useEffect(() => {
    // Back and Forward restore the visitor's place; only a new destination
    // starts at the top.
    if (!isHistoryNavigation()) scrollPageTo(0);
    useSceneStore.getState().setScroll(0);
  }, [pathname]);

  /**
   * THE CANVAS ONLY MOUNTS WHERE IT DRAWS, AND THAT IS THE WHOLE SPEED FIX.
   *
   * MEASURED, NOT GUESSED: every page of this shop was shipping 730KB of
   * JavaScript, and 717KB of it was three.js in two chunks. The scene has only
   * drawn on the homepage for a while now — every other route resolves to the
   * quiet ground and renders nothing — but the CODE still arrived everywhere,
   * because `dynamic()` does not defer anything on its own. It splits the
   * chunk; the download starts the moment the component is rendered. Rendering
   * CanvasHost unconditionally meant fetching, parsing and executing an entire
   * 3D engine on the bag, the checkout, the account, the shelf — pages that
   * never draw a single triangle.
   *
   * On a mid-range Android that is not a slow first paint, it is a locked main
   * thread: three quarters of a megabyte of JavaScript has to be parsed and
   * compiled before the page will answer a tap. That is what "the website is
   * very slow" and "lagging or stucking" describe, and no amount of design
   * work fixes it.
   *
   * Gating the render on the route means the chunk is only ever requested on
   * the homepage. Everything the store does — capability detection, the
   * route→scene map, the scroll reset — stays above, because it is cheap and
   * some of it is needed to decide there is nothing to draw.
   */
  if (!showsScene || !sceneWorthLoading) return null;

  return (
    <CanvasHost>
      <SceneRouter />
    </CanvasHost>
  );
}
