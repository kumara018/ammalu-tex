'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * NOT MOUNTED ON THIS SHOP. Kept for reference; see the note below.
 *
 * 21:9 matte bars on hero routes — in PAPER, not black.
 *
 * WHY IT IS NO LONGER IN THE LAYOUT. A matte is a cinema device, and it earns
 * its cost on the sister shop, which is a dark room where the bars read as the
 * edge of a frame. This shop is a workroom in daylight, and on a 1418x802
 * laptop a 21:9 matte takes 97 pixels off the top AND the bottom — 194px, a
 * quarter of the viewport — to draw two bars the same colour as the page. It
 * bought nothing and it pushed the opening headline off the bottom of the
 * screen, which is what the screenshot showed.
 *
 * Left in the tree rather than deleted because the behaviour (retract on
 * scroll, skip on already-wide viewports, honour reduced motion) is worth
 * having if a future page genuinely wants a framed shot.
 *
 * They were `bg-black`, carried over from the sister shop, where the whole
 * site is a dark room and a black matte reads as the edge of the frame. This
 * shop is a workroom in daylight: the ground is #FAF6F3, and two black bands
 * across it do not read as a frame, they read as a broken page. Screenshotted
 * at the top of the homepage they clipped the headline against a hard black
 * edge.
 *
 * Same device, same behaviour, the shop's own colour. A matte is the colour of
 * the wall the picture is hung on.
 *
 * Purely a CSS overlay — it never crops the canvas or changes the camera's
 * aspect. Cropping would cost real pixels and would push page content around;
 * this just draws the frame edge over the top, which is what a matte does.
 *
 * Two rules keep it from becoming a nuisance:
 *
 *   1. It only appears where the viewport is *taller* than 21:9. On a wide
 *      monitor the frame is already cinematic and bars would be decoration
 *      for its own sake.
 *   2. It retracts as soon as the visitor scrolls past the hero. Bars that
 *      persist over a product grid are just lost screen height, and on a
 *      phone that is the difference between seeing two products and four.
 *
 * pointer-events:none throughout: nothing here may ever intercept a tap, and
 * the bars sit at a z-index below the navigation so the header stays usable.
 */

const HERO_ROUTES = new Set(['/', '/products']);

export default function Letterbox() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion keeps the bars but never animates them in — they are a
    // static frame, not a move, so they stay; the transition is what goes.
    const wide = window.matchMedia('(min-aspect-ratio: 21/9)');
    const update = () => setEnabled(HERO_ROUTES.has(pathname) && !wide.matches);
    update();
    wide.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      void reduced;
    };
  }, [pathname]);

  useEffect(() => {
    if (!enabled) { setVisible(false); return; }
    const onScroll = () => setVisible(window.scrollY < window.innerHeight * 0.55);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);

  if (!enabled) return null;

  // 21:9 of the viewport width is the target frame height; the remainder is
  // split between the two bars.
  const bar = 'max(0px, calc((100vh - (100vw / 2.3333)) / 2))';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20">
      <div
        className="absolute inset-x-0 top-0 bg-paper motion-safe:transition-[height,opacity] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,0.61,0.24,1)]"
        style={{ height: bar, opacity: visible ? 1 : 0 }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-paper motion-safe:transition-[height,opacity] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,0.61,0.24,1)]"
        style={{ height: bar, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
