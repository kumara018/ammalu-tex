import Image from 'next/image';

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
 * WHY THE GROUND COMES WITH IT. The brown is part of the photograph, not a
 * layer behind it. Cutting the leaves out at 171px would leave ragged edges and
 * would mean altering the supplied file. So the mark sits on its own brown
 * tile — which is also how the sister shop works, where a photographed mark
 * rides a cerise tile. It is a badge, deliberately, rather than a silhouette.
 *
 * `size` is the rendered edge in pixels. The square file is used so the tile is
 * square wherever it lands; the padding on it is the artwork's own edge rows
 * replicated, so the gradient runs to the border without a seam.
 *
 * ONE PLACE, EVERY SURFACE. The header, the account menu, the invoice and the
 * auth pages all render this component, so replacing the artwork later means
 * replacing one file and nothing else.
 */
export function LogoMark({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo-square.png"
      alt=""
      width={size}
      height={size}
      /* The mark is decorative wherever it appears beside the shop's name in
         text; the name is the accessible label. An empty alt keeps a screen
         reader from announcing "Ammalu Tex" twice in a row. */
      aria-hidden="true"
      /* Sharp at any size without shipping four files: the source is 171px, so
         a 34px header mark is already served at 5x. */
      sizes={`${size}px`}
      className={`rounded-[3px] object-cover ${className}`}
      style={{ width: size, height: size }}
      priority={size >= 34}
    />
  );
}

/**
 * The lockup: the mark and the name, and nothing else.
 *
 * A location line was set under the name for one pass — the thing sewn into a
 * garment, saying who made it and where. It read as a caption, and a name that
 * needs a caption to feel like a name is not yet a name. The address belongs
 * in the footer, where somebody looking for the shop will go.
 */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="flex-shrink-0" size={34} />
      <p className="hidden font-display text-[1.4rem] leading-none tracking-tight text-graphite sm:block">
        Ammalu Tex
      </p>
    </div>
  );
}
