'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import {
  motion, useMotionValue, useSpring, useTransform,
  useReducedMotion, AnimatePresence,
} from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLoginPrompt } from '@/context/LoginPromptContext';
import { useWishlist } from '@/context/WishlistContext';
import toast from 'react-hot-toast';
import { mediaUrl } from '@/lib/media';
import { dyeFor, wovenGround } from '@/lib/dyes';

/**
 * A piece on the shelf.
 *
 * WHAT THIS REPLACES, AND WHY EACH PART HAD TO GO.
 *
 *   FOUR PILL BADGES stacked in the top-left corner — maroon for the
 *   discount, gold for featured, one with the literal class `bg-transparent0`
 *   (a typo that had been shipping, so "New Arrival" was white text on
 *   nothing), grey for out of stock. Four colours, four radii, all shouting
 *   over the photograph of the thing being sold. A garment does not need a
 *   sticker to be interesting; the sticker is what you add when you have
 *   stopped believing the photograph is enough.
 *
 *   AN EMOJI PLACEHOLDER — 👗 at 3.75rem when a product had no image. On a
 *   shop whose whole promise is "the colour you see is the colour that
 *   arrives", the fallback for a missing photograph was a cartoon.
 *
 *   YELLOW STARS. Five glyphs to encode one number, in a hue that appears
 *   nowhere else in this palette. It is now written as the measurement it is.
 *
 *   COVERFLOW. Each slide entered on a 14° Y-rotation. That is a 2007 iTunes
 *   effect, it fights the next card in the grid, and it tilts the garment —
 *   which is the one thing on the card that must be shown flat and true.
 *
 *   A FILLED MAROON BUTTON on every single card. Twenty of them in a grid is
 *   twenty demands, and none of them is the photograph.
 *
 * WHAT IT DOES INSTEAD. The plate holds the garment and nothing else. The
 * card carries ONE piece of live 3D — a pointer-tracked tilt with a specular
 * sheen that tracks the pointer across it — because a card that responds to
 * where your hand is reads as an object under a light, and that is the whole
 * difference between a catalogue and a showroom.
 *
 * The tilt is 5.5° at the extremes, spring-damped, and driven entirely by two
 * motion values on the compositor — no React re-render per pointer move, no
 * layout, no paint. It is off for touch (where there is no pointer to track)
 * and off for anyone who asked for less motion, and in both cases the card is
 * still a complete, clickable, keyboard-reachable product.
 */

interface Props { product: Product; }

const TILT = 5.5;

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { promptLogin } = useLoginPrompt();
  const { wishlistIds, toggle } = useWishlist();
  const isWishlisted = wishlistIds.includes(product.id);
  const [toggling, setToggling] = useState(false);
  const reduced = useReducedMotion();

  // ── Slides ────────────────────────────────────────────────────────────────
  const images = (product.images || []).filter(Boolean);
  const hasVideo = Boolean(product.video_url);
  const totalSlides = images.length + (hasVideo ? 1 : 0);

  const [imgIdx, setImgIdx] = useState(0);
  const [hovering, setHovering] = useState(false);
  const touchStartX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goCard = useCallback((idx: number) => {
    if (totalSlides === 0) return;
    setImgIdx((idx + totalSlides) % totalSlides);
  }, [totalSlides]);

  /**
   * THE GALLERY SLIDES ON ITS OWN, AND ONLY WHERE IT CAN BE SEEN.
   *
   * It advanced only on hover, which I argued for and which is wrong for this
   * shop. Hover does not exist on a phone, so on the device most customers use
   * the extra photographs were unreachable — a piece with four angles showed
   * one, forever. The shop asked for automatic sliding and the customers are
   * right: on a listing page the second photograph is what sells the piece.
   *
   * Two things keep it from becoming the wall of movement I was worried about:
   *
   *   IT ONLY RUNS WHEN THE CARD IS ON SCREEN. An IntersectionObserver stops
   *   every card the customer has scrolled past, so twenty cards never animate
   *   at once — usually two or three do, and the rest cost nothing.
   *
   *   IT SLOWS DOWN, IT DOES NOT SPEED UP. 3.2s per slide reads as a garment
   *   turning; the old 1.6s hover rate reads as a flicker. Hovering still
   *   quickens it to 1.6s, because someone pointing at a card has asked to see
   *   the rest now.
   *
   * Off entirely for reduced-motion, where the first photograph simply stays.
   */
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = plate.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setOnScreen(true); return; }
    const io = new IntersectionObserver(
      ([e]) => setOnScreen(e.isIntersecting),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (totalSlides <= 1 || reduced || !onScreen) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setImgIdx((i) => (i + 1) % totalSlides);
    }, hovering ? 1600 : 3200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [totalSlides, hovering, reduced, onScreen]);

  // ── The tilt ──────────────────────────────────────────────────────────────
  const plate = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);   // pointer position across the plate, 0..1
  const py = useMotionValue(0.5);
  const spring = { stiffness: 150, damping: 20, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateY = useTransform(sx, [0, 1], [-TILT, TILT]);
  const rotateX = useTransform(sy, [0, 1], [TILT, -TILT]);
  // The sheen follows the pointer, so the highlight is where the hand is.
  const sheenX = useTransform(sx, [0, 1], ['22%', '78%']);
  const sheenY = useTransform(sy, [0, 1], ['18%', '82%']);
  const sheen = useTransform(
    [sheenX, sheenY],
    ([x, y]: string[]) =>
      `radial-gradient(58% 46% at ${x} ${y}, rgba(255,253,251,0.42) 0%, rgba(255,253,251,0) 68%)`,
  );

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === 'touch') return;
    const r = plate.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const rest = () => { px.set(0.5); py.set(0.5); };

  // ── Touch swipe ───────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 35) goCard(delta < 0 ? imgIdx + 1 : imgIdx - 1);
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { promptLogin('Sign in to save pieces.'); return; }
    if (toggling) return;
    setToggling(true);
    await toggle(product.id);
    setToggling(false);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { promptLogin('Sign in to add pieces to your bag.'); return; }
    try {
      await addItem(product.id, 1);
      toast.success(`${product.name} — in your bag`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not add to the bag');
    }
  };

  const isVideoSlide = hasVideo && imgIdx === images.length;
  const currentImg = !isVideoSlide && images[imgIdx] ? mediaUrl(images[imgIdx]) : null;
  const soldOut = product.stock === 0;
  /* The category's dye — read once, used only if there is no photograph. */
  const dye = dyeFor(product.category);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.24, 1] }}
      className="h-full"
    >
      <Link href={`/products/${product.id}`} className="group flex h-full flex-col">
        {/* ── The plate ────────────────────────────────────────────────────── */}
        <div style={{ perspective: 1100 }}>
          <motion.div
            ref={plate}
            onPointerMove={onPointerMove}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => { setHovering(false); rest(); }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            /* NO FRAME. The plate was a hairline box with a tinted fill and
               the garment sat inside it with 20px of padding, letterboxed by
               object-contain — so every piece was a small picture mounted in a
               window rather than the piece itself. The sister shop fills its
               plates edge to edge and reads far better for it. The photograph
               IS the plate now: it covers, it bleeds to the edges, and the
               only thing drawn around it is the shadow it casts on hover. */
            className="relative aspect-[3/4] overflow-hidden bg-paper-shade shadow-[0_1px_2px_rgba(51,39,34,0.06)] transition-shadow duration-700 group-hover:shadow-[0_18px_44px_-16px_rgba(51,39,34,0.32)]"
          >
            <AnimatePresence mode="sync" initial={false}>
              {isVideoSlide ? (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 0.61, 0.24, 1] }}
                  className="absolute inset-0 flex items-center justify-center bg-graphite"
                >
                  {/* A play mark drawn as a rule and a triangle, in the
                      shop's own colours — not a black slab with a white
                      glyph borrowed from a video site. */}
                  <span className="flex items-center gap-3 text-rule uppercase text-paper/80">
                    <span aria-hidden="true" className="block h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-thread-pale" />
                    On film
                  </span>
                </motion.div>
              ) : currentImg ? (
                <motion.img
                  key={currentImg}
                  src={currentImg}
                  alt={product.name}
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 0.61, 0.24, 1] }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                /**
                 * NO PHOTOGRAPH — SHOWN AS THE CLOTH, NOT AS AN ABSENCE.
                 *
                 * Seventeen of this shop's nineteen products have no image in
                 * the database. An emoji used to fill this plate, which hid
                 * that; the words "Photograph to come" replaced it, which
                 * revealed it and read as a broken page.
                 *
                 * A bolt of cloth on a shelf is known by its dye long before
                 * anyone unfolds it. So the plate becomes the dye: a woven
                 * ground in the category's own colour. See lib/dyes.ts.
                 *
                 * IT CARRIES ONLY THE DYE'S NAME, and that restraint is the
                 * point. The first version of this repeated the piece's name on
                 * the plate — but the caption sitting directly beneath already
                 * gives category, name, fabric and price, so the name appeared
                 * twice about 110px apart, which reads as a rendering bug
                 * rather than as design. The plate's job is to be the cloth.
                 * The caption's job is to say what it is. Neither does the
                 * other's.
                 */
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={wovenGround(dye, product.id)}
                  className="absolute inset-0 flex flex-col justify-between p-5"
                >
                  <span className="block">
                    <span
                      aria-hidden="true"
                      className="mb-2.5 block h-px w-8"
                      style={{ backgroundColor: dye.ink, opacity: 0.4 }}
                    />
                    <span
                      className="block text-caption uppercase"
                      style={{ color: dye.ink, opacity: 0.5 }}
                    >
                      Not yet photographed
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The sheen. Sits above the garment at 42% white, which lifts the
                plate under the pointer without washing out the cloth. */}
            {!reduced && (
              <motion.span
                aria-hidden="true"
                style={{ backgroundImage: sheen }}
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}

            {/* Sold out states the fact across the plate rather than as a
                grey pill in a corner — it changes whether you can buy it. */}
            {soldOut && (
              <span className="absolute inset-x-0 bottom-0 bg-graphite/85 py-2 text-center text-rule uppercase text-paper">
                Sold out
              </span>
            )}

            {/* Saving a piece: a hairline heart, no white disc, no shadow. */}
            <button
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Remove from saved pieces' : 'Save this piece'}
              className={`absolute right-3 top-3 z-10 transition-opacity duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread ${
                isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
              }`}
            >
              <Heart
                size={17}
                className={isWishlisted ? 'text-thread-deep' : 'text-graphite-muted hover:text-thread'}
                fill={isWishlisted ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </button>

            {/* NO PREV / NEXT ARROWS.
                They were added to match the sister shop and are removed from
                both on the shop's call. The reasoning holds up: on a phone the
                control is a SWIPE, which this card handles at a 35px
                threshold, and the gallery already advances itself every 3.2s.
                The arrows only ever added two more objects on top of the
                photograph the card exists to sell. The measure along the
                bottom edge still says how many pictures there are, and the
                product page carries the full gallery. */}

            {/**
             * The slide indicator is a measure, not dots.
             *
             * One segment per slide, laid along the bottom edge, the current
             * one in thread — the same instrument as the rule on the shelf
             * and the thread on the rail. White dots on a photograph are the
             * carousel every storefront ships.
             */}
            {totalSlides > 1 && (
              <span aria-hidden="true" className="absolute inset-x-5 bottom-3 z-10 flex gap-1">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-px flex-1 transition-colors duration-300 ${
                      i === imgIdx ? 'bg-thread' : 'bg-graphite/20'
                    }`}
                  />
                ))}
              </span>
            )}
          </motion.div>
        </div>

        {/* ── The caption ──────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col pt-4">
          <p className="text-rule uppercase text-graphite-faint">{product.category}</p>

          <h3 className="mt-2 line-clamp-2 font-display text-[1.15rem] leading-snug text-graphite transition-colors duration-500 group-hover:text-thread">
            {product.name}
          </h3>

          {/* Fabric and rating on one ruled line — both are measurements of
              the piece, and neither deserves its own row. */}
          {(product.fabric || product.rating_count > 0) && (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-3 text-caption uppercase text-graphite-faint">
              {product.fabric && <span>{product.fabric}</span>}
              {product.rating_count > 0 && (
                <span className="tabular-nums text-thread">
                  {product.rating_avg.toFixed(1)}<span className="text-graphite-faint">/5 · {product.rating_count}</span>
                </span>
              )}
            </p>
          )}

          <div className="mt-auto pt-5">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[1.45rem] leading-none text-graphite tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compare_price && (
                <span className="text-caption text-graphite-faint line-through tabular-nums">
                  ₹{product.compare_price.toLocaleString('en-IN')}
                </span>
              )}
              {discount ? (
                <span className="text-caption uppercase tabular-nums text-thread">−{discount}%</span>
              ) : null}
            </div>

            {/**
             * The action is a ruled line that fills on hover.
             *
             * Twenty filled maroon rectangles in a grid is twenty things
             * competing with twenty photographs, and the photograph is what
             * sells the garment. This is present, unambiguous and the full
             * width of the card, but it only becomes solid when you reach
             * for it.
             */}
            <button
              onClick={handleAddToCart}
              disabled={soldOut}
              /* FILLED, BUT LIGHT — WHICH IS NOT THE SAME AS OUTLINED.
                 It was a solid #A4664D slab with white on it. Solid enough to
                 find, and the note that came back three times was that a dark
                 block on a pale card is the first thing the eye lands on, so
                 the card reads as the button rather than as the cloth.
                 A bare outline overcorrects — that was the version before, and
                 it was the quietest thing on the card.
                 So it stays filled and the fill goes pale: #E3BCAC ground with
                 the deep tone moved into the type and a hairline edge. It is
                 still a solid object, still full width, and the contrast goes
                 UP rather than down — graphite on thread-pale measures 8.29:1
                 against 4.58:1 for the white-on-deep it replaces, and the
                 #A4664D hairline is 4.26:1 against the page ground, so the
                 control edge clears WCAG 1.4.11 on its own. */
              className="mt-4 w-full border border-thread-deep bg-thread-pale py-2.5 text-caption uppercase text-graphite transition-colors duration-500 hover:bg-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread disabled:cursor-not-allowed disabled:border-paper-edge disabled:bg-paper-shade disabled:text-graphite-faint motion-reduce:transition-none"
            >
              {soldOut ? 'Sold out' : 'Add to the bag'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
