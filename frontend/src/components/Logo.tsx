/**
 * The maker's stamp.
 *
 * WHAT WAS HERE. The letter A set in `-apple-system, SF Pro Display` at weight
 * 900, inside a plain elliptical stroke. Two problems, and the second is the
 * one that matters:
 *
 *  1. The face was the operating system's UI font. Not the shop's display
 *     face, not any face the site loads — the mark was set in whatever
 *     happened to be installed, which means the identity rendered differently
 *     on a Mac, a PC and a phone. An identity that changes per device is not
 *     an identity.
 *
 *  2. It was a letter in a circle. That is the shape of an avatar, a
 *     placeholder, the thing a CMS generates when nobody has uploaded a logo
 *     yet — which is exactly why it read as generic brand text rather than as
 *     this shop's own mark.
 *
 * The pass after that made it a stitched stamp — the A in Instrument Serif
 * inside a dashed oval. Better, and it still had the flaw underneath: a letter.
 * The owner, shown five alternatives, ruled out every one that contained one.
 *
 * WHAT IT IS NOW. A plain weave. Three weft threads crossed by three warp
 * threads, alternating over and under exactly as woven cloth does.
 *
 * THE GAPS ARE THE MARK, and they are worth explaining because they look like
 * a drawing error if you do not know what they are for.
 *
 * The first attempt drew the weft whole, the warp whole on top, and then
 * redrew short weft segments over the crossings that should pass over. That
 * does nothing: every stroke is `currentColor`, so painting the same colour on
 * itself is invisible. Rendered at five sizes it was a hash — a grid, a
 * spreadsheet, a window — and no amount of intent made it read as cloth.
 *
 * Interlacing is only visible when the thread underneath is INTERRUPTED. So
 * each line breaks where another crosses over it, and the breaks alternate, so
 * every one of the nine crossings has exactly one thread over and one under.
 * That is a plain weave, and it is the difference between a symbol of textiles
 * and the structure of the thing itself.
 *
 * WHY IT BEAT THE OTHER FOUR. It is the only one that survives every place a
 * logo has to go: 16px in a browser tab, embroidered on a label, stamped on a
 * bag, printed one-colour on an invoice. The kolam softened at favicon size,
 * the bolt and the drape lost their curves, and the stitch — the closest
 * runner-up — needs a dash pattern that thickens into a solid ring when the
 * stroke gets heavy enough to read small.
 *
 * Six strokes, no letterform, no asset, and `currentColor` throughout so it
 * inherits whatever it is set on. The header, the account menu, the invoice
 * and the auth pages all read from this one component, so the mark is the same
 * shape everywhere rather than four approximations of one drawing.
 */
export function LogoMark({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={`logo-mark ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
        {/* Weft — carried across. Each line breaks where a warp thread
            crosses over it: y=20 and y=40 pass under at x=20 and x=40, y=30
            passes under at x=30. */}
        <path d="M15 20 H17.4 M22.6 20 H37.4 M42.6 20 H45" />
        <path d="M15 30 H27.4 M32.6 30 H45" />
        <path d="M15 40 H17.4 M22.6 40 H37.4 M42.6 40 H45" />
        {/* Warp — held on the loom. Breaks are the mirror of the weft's, so
            every crossing has exactly one thread over and one under. */}
        <path d="M20 15 V27.4 M20 32.6 V45" />
        <path d="M30 15 V17.4 M30 22.6 V37.4 M30 42.6 V45" />
        <path d="M40 15 V27.4 M40 32.6 V45" />
      </g>
    </svg>
  );
}

/**
 * The lockup: the stamp and the name, and nothing else.
 *
 * A location line was set under the name for one pass — the thing sewn into a
 * garment, saying who made it and where. It read as a caption, and a name that
 * needs a caption to feel like a name is not yet a name. The address belongs
 * in the footer, where somebody looking for the shop will go.
 *
 * So the identity is carried by the two things that are actually this shop's:
 * the stitched stamp above, and the name set in the display face at a size
 * that reads as a signature rather than a label.
 */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="text-thread flex-shrink-0" size={34} />
      <p className="hidden font-display text-[1.4rem] leading-none tracking-tight text-graphite sm:block">
        Ammalu Tex
      </p>
    </div>
  );
}
