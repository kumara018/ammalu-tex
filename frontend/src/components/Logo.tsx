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
 * WHAT IT IS NOW. A stitched stamp. The A is set in Instrument Serif, the same
 * high-contrast face the shop signs its headlines with, so the mark and the
 * name are visibly the same hand. Around it runs a **running stitch** — a
 * dashed oval whose dash and gap are the proportions of a real hand stitch,
 * drawn with a round cap so each dash is a thread end rather than a tick.
 *
 * The stitch is the whole idea: it is the one mark a tailoring workroom would
 * actually make, no storefront template ships it, and it is four attributes of
 * SVG rather than an asset. On hover the stitch travels — `stroke-dashoffset`
 * animating by exactly one dash period, so it reads as thread being pulled
 * through rather than as a spinner.
 *
 * The A is still an A: swapping in a real logo file later means replacing this
 * one component, and nothing else on the site knows the difference.
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
      {/* The oval sits slightly off square, the way a stamp lands by hand. */}
      <g transform="rotate(-6 30 30)">
        <ellipse
          className="logo-stitch"
          cx="30" cy="30" rx="22.5" ry="26.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          // 4 on, 5 off: a stitch slightly shorter than its gap, which is what
          // hand running-stitch actually looks like. A machine stitch has no
          // gap at all, and that is the difference being drawn here.
          strokeDasharray="4 5"
        />
      </g>
      <text
        x="30" y="32"
        fontFamily="var(--font-display), Georgia, 'Times New Roman', serif"
        fontWeight="400"
        fontSize="34"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
      >
        A
      </text>
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
