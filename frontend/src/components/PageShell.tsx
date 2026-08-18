'use client';

/**
 * The frame every page after the homepage sits in.
 *
 * ITS MAIN JOB IS TO NOT PAINT A BACKGROUND. The canvas is `position: fixed`
 * at z-0 and each route animates its own scene inside it — the cutting table
 * on the listing, the dress form on a product, the basket on the cart. A page
 * that sets its own opaque ground covers all of that while still costing every
 * draw call to render it, which is exactly how this shop ended up with a full
 * 3D platform nobody could see.
 *
 * So: no background here. The body paints the paper ground, the scene shows
 * through the gaps, and anything that genuinely needs an opaque surface asks
 * for it locally with `bg-paper`.
 *
 * `rhythm` is the only knob. A reading page wants air; a page that is mostly
 * a grid or a form wants the content to start sooner.
 */
export default function PageShell({
  children,
  rhythm = 'normal',
  className = '',
}: {
  children: React.ReactNode;
  rhythm?: 'tight' | 'normal' | 'wide';
  className?: string;
}) {
  const pad = {
    tight:  'pt-[clamp(2rem,6vh,4rem)] pb-[clamp(4rem,10vh,7rem)]',
    normal: 'pt-[clamp(3rem,9vh,6rem)] pb-[clamp(5rem,12vh,9rem)]',
    wide:   'pt-[clamp(4rem,13vh,8rem)] pb-[clamp(6rem,16vh,11rem)]',
  }[rhythm];

  return (
    <div className={`relative px-6 sm:px-10 ${pad} ${className}`}>
      <div className="mx-auto w-full max-w-[104rem]">{children}</div>
    </div>
  );
}
