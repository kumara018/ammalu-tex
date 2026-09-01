import Image from 'next/image';
import { STORE } from '@/lib/config';

/**
 * The maker's mark.
 *
 * WHAT WAS HERE, IN ORDER. A letter A in the operating system's UI font inside
 * a plain ellipse — an identity that rendered differently on every device. Then
 * a stitched stamp: the A in Instrument Serif ringed by a running stitch. Then,
 * when the owner ruled out anything containing a letter, a drawn plain weave.
 *
 * WHAT IT IS NOW. The shop's own artwork — a carved botanical sprig, supplied
 * by the owner, used as given. Not redrawn, not traced, not approximated. Every
 * previous version of this component was something invented on the shop's
 * behalf because it had no mark of its own; it has one now, so the component's
 * job changes from drawing to placing.
 *
 * WHY IT IS AN IMAGE AND NOT SVG. The artwork is a photograph of a carved
 * surface — grain, relief, a soft gradient behind it. None of that survives a
 * conversion to paths, and tracing it would be exactly the redrawing the owner
 * asked not to have. So the file is placed as it is.
 *
 * WHY THE GROUND IS GONE. It shipped once as a brown tile, because the brown is
 * part of the photograph rather than a layer behind it. On the cream header
 * that read as a badge stuck beside the name, which is not what the artwork is,
 * so the ground was keyed out on luminance: the leaves sit around 110–160 and
 * the ground around 60, which is a wide enough gap to separate cleanly with a
 * soft ramp for the edges.
 *
 * WHY IT IS TERRACOTTA RATHER THAN THE ARTWORK'S OWN TAN. The tan measures
 * 2.5:1 against the shop's paper — under the 3:1 WCAG asks of a graphical
 * object, so on the header it would be a pale smudge. thread-deep gives 4.2:1
 * on paper and still 3.2:1 on the dark counter, so one file serves both grounds
 * and the shape is exactly the shape that was supplied.
 *
 * `size` is the rendered edge in pixels. The file is cropped square to the ink
 * with a tenth of its width as margin, so the mark fills its box at every size
 * instead of floating in the middle of one.
 *
 * ONE PLACE, EVERY SURFACE. The header, the account menu, the invoice and the
 * auth pages all render this component, so replacing the artwork later means
 * replacing one file and nothing else.
 */
export function LogoMark({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={size}
      height={size}
      /* The mark is decorative wherever it appears beside the shop's name in
         text; the name is the accessible label. An empty alt keeps a screen
         reader from announcing "Ammalu Tex" twice in a row. */
      aria-hidden="true"
      /*
       * SERVED AS-IS, AND `sizes` IS DELIBERATELY ABSENT.
       *
       * With `sizes` set, next/image builds a srcset across every device width
       * up to 3840 and lets the browser choose. On the live site one instance
       * duly asked for a 3840px render — of a 171px source. That is Next
       * upscaling a small photograph twenty-two times over: slower, no sharper,
       * and a billed image optimisation for every size it lands on.
       *
       * `unoptimized` skips the optimiser entirely. The file is 2KB and never
       * displayed above 46px, so there is nothing for a transform to win: the
       * source is already smaller than any rendition of it would be. It also
       * means the mark is byte-identical everywhere it appears, which is the
       * whole point of using the supplied artwork rather than a redrawing.
       */
      unoptimized
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * The lockup: the mark, the name, and the line the shop signs itself with.
 *
 * A LOCATION line was set here once — the thing sewn into a garment, saying who
 * made it and where. It read as a caption, and a name needing a caption to feel
 * like a name is not yet a name; the address belongs in the footer, where
 * somebody looking for the shop will go.
 *
 * A TAGLINE is a different object. "Timeless fabrics. Thoughtful choices." is
 * not explaining the name, it is the shop's own sentence, and it is what the
 * owner's own artwork sets beneath it. So it stays.
 */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="flex-shrink-0" size={38} />
      {/* Name and line set as one block, so the mark reads as sitting beside a
          signature rather than beside a stack of two unrelated things. Hidden
          together below `sm`, where the mark alone is the identity. */}
      <div className="hidden sm:block">
        <p className="font-display text-[1.4rem] leading-none tracking-tight text-graphite">
          {STORE.name}
        </p>
        {/* The tagline the shop signs itself with. Set at rule size in the
            accent, which is where terracotta belongs — carrying a short line of
            small caps, not a paragraph. */}
        <p className="mt-1 text-[0.58rem] uppercase tracking-[0.19em] text-thread-deep">
          {STORE.tagline}
        </p>
      </div>
    </div>
  );
}
