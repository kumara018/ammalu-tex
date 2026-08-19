'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, Star, Truck, RotateCcw, Shield, XCircle,
  ArrowLeft, AlertCircle, CheckCircle, ChevronRight, Send,
  ChevronLeft, Play, Pause, Heart,
} from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { Product, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLoginPrompt } from '@/context/LoginPromptContext';
import { useWishlist } from '@/context/WishlistContext';
import toast from 'react-hot-toast';
import { mediaUrl } from '@/lib/media';
import { dyeFor, wovenGround } from '@/lib/dyes';
import { STORE } from '@/lib/config';

// ── helpers ──────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function resolveUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return mediaUrl(url);
}

// ── Custom MP4 player (centered Play/Pause like Amazon) ──────────────────────
function CustomVideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [showBtn, setShowBtn] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowBtn(false), 2000);
  };

  const revealBtn = () => {
    setShowBtn(true);
    if (!videoRef.current?.paused) scheduleHide();
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  return (
    // relative wrapper — video + controls bar stack naturally inside
    <div className="relative w-full h-full bg-black" onMouseMove={revealBtn} onTouchStart={revealBtn}>
      {/* Native video — keeps progress bar, runtime, volume, fullscreen */}
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        playsInline
        controls
        onPlay={() => { setPlaying(true); scheduleHide(); }}
        onPause={() => { setPlaying(false); setShowBtn(true); if (hideTimer.current) clearTimeout(hideTimer.current); }}
        onEnded={() => { setPlaying(false); setShowBtn(true); if (hideTimer.current) clearTimeout(hideTimer.current); }}
      />

      {/* Centered big Play/Pause button — floats above video, clears native controls bar */}
      <div
        className={`absolute inset-x-0 top-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showBtn ? 'opacity-100' : 'opacity-0'}`}
        style={{ bottom: 56 }}   /* leave native controls bar (~50px) exposed */
      >
        <button
          className="pointer-events-auto rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-150"
          onClick={togglePlay}
          style={{
            width: 76, height: 76,
            background: 'rgba(0,0,0,0.50)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '2.5px solid rgba(255,255,255,0.80)',
            boxShadow: '0 6px 28px rgba(0,0,0,0.45)',
          }}
        >
          {playing
            ? <Pause size={32} fill="white" className="text-white" />
            : <Play  size={32} fill="white" className="text-white" style={{ marginLeft: 4 }} />
          }
        </button>
      </div>
    </div>
  );
}

// ── Video slide ───────────────────────────────────────────────────────────────
function VideoSlide({ url }: { url: string }) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return <CustomVideoPlayer url={url} />;
}

/**
 * The gallery.
 *
 * WHAT WAS HERE. A square plate with two white circular arrows floating on the
 * garment, a dark pill counter, a row of dots, and a horizontal thumbnail
 * strip underneath with a maroon ring around the active one. That is the
 * marketplace carousel: the same object on every storefront, three separate
 * indicators (dots, counter, thumbnails) saying one thing, and the widest part
 * of the page spent on chrome rather than cloth.
 *
 * WHAT IT IS NOW, AND WHY EACH DECISION.
 *
 *   THE RAIL MOVED TO THE SIDE. Thumbnails run vertically down the left on a
 *   wide screen. It is how a showroom presents a piece — the options beside
 *   the thing, not stacked under it — and it gives the plate the full column
 *   height instead of the height left over after a strip.
 *
 *   ONE INDICATOR, NOT THREE. The rail IS the indicator, so the dots are gone.
 *   The counter stays, because it is the only thing that says how many more
 *   there are before you start clicking, and it is set as a number (03 / 07)
 *   rather than a dark pill laid over the garment.
 *
 *   ZOOM. Hold the pointer over the plate and the image magnifies 2x around
 *   exactly the point you are on. This is the one interaction on the site
 *   worth real engineering: someone deciding whether to spend two thousand
 *   rupees on a garment wants to see the weave, the stitching and the
 *   embroidery, and no amount of description substitutes for it. It is
 *   `transform-origin` plus a scale on the compositor — no second image, no
 *   canvas, no library — and it is off for touch, where a pointer position
 *   does not exist, and off for reduced motion.
 *
 *   THE ARROWS ARE HAIRLINES. A white disc on a photograph is a hole punched
 *   in the product shot. These are chevrons in the shop's ink, on hover.
 */
function ProductCarousel({ images, videoUrl, videoOrientation, name, category, seed }: { images: string[]; videoUrl?: string; videoOrientation?: string; name: string; category?: string; seed?: number }) {
  const slides: Array<{ type: 'image' | 'video'; src: string }> = [
    ...images.map(img => ({ type: 'image' as const, src: resolveUrl(img) })),
    ...(videoUrl ? [{ type: 'video' as const, src: videoUrl }] : []),
  ];

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const dragging = useRef(false);
  const plate = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const go = useCallback((idx: number) => {
    if (slides.length === 0) return;
    setActive((idx + slides.length) % slides.length);
  }, [slides.length]);

  const prev = () => go(active - 1);
  const next = () => go(active + 1);

  // Arrow keys move through the gallery once it has focus — a keyboard user
  // should not have to tab through every thumbnail to see the second view.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    dragDeltaX.current = e.touches[0].clientX - dragStartX.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(dragDeltaX.current) > 40) { if (dragDeltaX.current < 0) next(); else prev(); }
    dragDeltaX.current = 0;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
  };
  const onMouseUp = () => {
    if (dragging.current && Math.abs(dragDeltaX.current) > 40) {
      if (dragDeltaX.current < 0) next(); else prev();
    }
    dragging.current = false;
    dragDeltaX.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) dragDeltaX.current = e.clientX - dragStartX.current;
    if (reduced || e.pointerType === 'touch') return;
    const r = plate.current?.getBoundingClientRect();
    if (!r) return;
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  if (slides.length === 0) {
    return (
      /* The dye stands in for the photograph — see lib/dyes.ts. This screen
         gets the full plate, because it is the one place a customer came
         specifically to look at the piece. The piece's own name sits in the
         column beside this, so the plate does not repeat it. */
      <div
        style={wovenGround(dyeFor(category), seed)}
        className="flex aspect-square flex-col justify-between p-8"
      >
        <span className="block">
          <span
            aria-hidden="true"
            className="mb-4 block h-px w-14"
            style={{ backgroundColor: dyeFor(category).ink, opacity: 0.4 }}
          />
          <span
            className="block max-w-[34ch] text-caption uppercase"
            style={{ color: dyeFor(category).ink, opacity: 0.55 }}
          >
            Not yet photographed &middot; call the counter and we will describe it
          </span>
        </span>
      </div>
    );
  }

  const current = slides[active];
  const isPortraitVideo = current.type === 'video' && videoOrientation === 'portrait';

  return (
    <div className="flex select-none flex-col-reverse gap-4 sm:flex-row sm:gap-5">
      {/* The rail. Horizontal below `sm`, where a vertical one would eat the
          screen; vertical above it, where the plate has height to spare. */}
      {slides.length > 1 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto pb-1 sm:max-h-[34rem] sm:w-[4.5rem] sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`View ${i + 1} of ${slides.length}`}
              aria-current={i === active}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden border-b-2 bg-paper-shade transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread sm:w-full ${
                i === active ? 'border-thread opacity-100' : 'border-transparent opacity-55 hover:opacity-100'
              }`}
            >
              {s.type === 'image' ? (
                <img src={s.src} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-graphite">
                  <span aria-hidden="true" className="block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-thread-pale" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* The plate. */}
      <div
        ref={plate}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="group"
        aria-label={`${name} — gallery`}
        className={`group relative flex-1 overflow-hidden bg-paper-shade focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread ${
          current.type === 'image' ? 'cursor-zoom-in' : ''
        }`}
        style={{
          aspectRatio: current.type === 'video' ? (isPortraitVideo ? '9/16' : '16/9') : '1/1',
          maxWidth: isPortraitVideo ? '420px' : undefined,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onPointerMove={onPointerMove}
        onPointerEnter={() => { if (current.type === 'image') setZoom(true); }}
        onPointerLeave={() => { setZoom(false); onMouseUp(); }}
      >
        {current.type === 'image' ? (
          <img
            key={current.src}
            src={current.src}
            alt={`${name} — view ${active + 1} of ${slides.length}`}
            draggable={false}
            style={{ transformOrigin: origin, transform: zoom && !reduced ? 'scale(2)' : 'scale(1)' }}
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] motion-reduce:transition-none"
          />
        ) : (
          <VideoSlide url={current.src} />
        )}

        {slides.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              aria-label="Previous view"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 p-2 text-graphite opacity-0 transition-opacity duration-500 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread group-hover:opacity-100"
            >
              <ChevronLeft size={22} strokeWidth={1.25} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              aria-label="Next view"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 p-2 text-graphite opacity-0 transition-opacity duration-500 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread group-hover:opacity-100"
            >
              <ChevronRight size={22} strokeWidth={1.25} />
            </button>

            {/* The count, as a number. */}
            <span className="absolute bottom-4 right-5 z-10 text-rule uppercase tabular-nums text-graphite-faint">
              {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </>
        )}

        {current.type === 'image' && !reduced && (
          <span className="pointer-events-none absolute bottom-4 left-5 z-10 hidden text-rule uppercase text-graphite-faint transition-opacity duration-500 group-hover:opacity-0 sm:block">
            Hover to inspect
          </span>
        )}

        {current.type === 'video' && (
          <span className="absolute left-5 top-4 z-10 text-rule uppercase text-paper/80">On film</span>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { promptLogin } = useLoginPrompt();
  const { wishlistIds, toggle: toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [sizeErr, setSizeErr] = useState(false);
  const [colorErr, setColorErr] = useState(false);
  const [tab, setTab] = useState<'desc' | 'care' | 'reviews'>('desc');

  const [canReview, setCanReview]       = useState(false);
  const [reviewReason, setReviewReason] = useState('');
  const [myRating, setMyRating]         = useState(0);
  const [hoverRating, setHoverRating]   = useState(0);
  const [myTitle, setMyTitle]           = useState('');
  const [myComment, setMyComment]       = useState('');
  const [submitting, setSubmitting]     = useState(false);

  const isWishlisted = product ? wishlistIds.includes(product.id) : false;

  useEffect(() => {
    const load = async () => {
      try {
        const calls: Promise<any>[] = [
          productsAPI.getOne(Number(id)),
          productsAPI.getReviews(Number(id)),
        ];
        if (user) calls.push(productsAPI.canReview(Number(id)));
        const [pRes, rRes, crRes] = await Promise.all(calls);
        setProduct(pRes.data);
        setReviews(rRes.data);
        if (pRes.data.size_options?.length) setSelectedSize(pRes.data.size_options[0]);
        if (pRes.data.colors?.length) setSelectedColor(pRes.data.colors[0]);
        if (crRes) {
          setCanReview(crRes.data.can_review);
          setReviewReason(crRes.data.reason);
        }
      } catch { router.push('/products'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, user]);

  // "Write a Review" links here with #reviews, but the Reviews section is
  // tab state, not a real DOM anchor — a plain hash link would just scroll
  // to the (still-collapsed) tab bar. Switch to that tab once loaded.
  useEffect(() => {
    if (!loading && window.location.hash === '#reviews') {
      setTab('reviews');
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading]);

  const handleAddToCart = async () => {
    if (!user) { promptLogin('Sign in to add this item to your cart and place an order.'); return; }
    let hasErr = false;
    if (product!.size_options?.length > 0 && !selectedSize) { setSizeErr(true); hasErr = true; }
    if (product!.colors?.length > 0 && !selectedColor) { setColorErr(true); hasErr = true; }
    if (hasErr) { toast.error('Please select size and colour before adding to cart'); return; }
    setAdding(true);
    try {
      await addItem(product!.id, quantity, selectedSize, selectedColor);
      toast.success('Added to cart!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart');
    } finally { setAdding(false); }
  };

  const handleBuyNow = async () => { await handleAddToCart(); router.push('/cart'); };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myRating === 0) { toast.error('Please select a star rating'); return; }
    if (!myComment.trim()) { toast.error('Please write a review comment'); return; }
    setSubmitting(true);
    try {
      const res = await productsAPI.addReview(Number(id), {
        product_id: Number(id), rating: myRating,
        title: myTitle.trim() || undefined, comment: myComment.trim(),
      });
      setReviews(prev => [res.data, ...prev]);
      setCanReview(false);
      setReviewReason('already_reviewed');
      setMyRating(0); setMyTitle(''); setMyComment('');
      toast.success('Thank you for your review! 🌟');
      if (product) {
        const newCount = product.rating_count + 1;
        const newAvg = ((product.rating_avg * product.rating_count) + myRating) / newCount;
        setProduct({ ...product, rating_avg: Math.round(newAvg * 10) / 10, rating_count: newCount });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        <div className="bg-paper-shade aspect-square rounded-sm" />
        <div className="space-y-4">
          <div className="h-6 bg-paper-shade rounded w-1/4" />
          <div className="h-8 bg-paper-shade rounded" />
          <div className="h-10 bg-paper-shade rounded w-1/3" />
          <div className="h-24 bg-paper-shade rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  // Build tabs: only show Care tab if there's care/fit/material data
  const hasCareData = product.fit || product.material || product.care_instructions || product.fabric;
  const TABS = [
    { key: 'desc',    label: 'Description' },
    ...(hasCareData ? [{ key: 'care', label: 'Fit & Care' }] : []),
    { key: 'reviews', label: `Reviews (${product.rating_count})` },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/**
        * THE WAY BACK, DRAWN AS A CONTROL.
        *
        * There was already a link here and it still got the question "how can
        * we go back" — which is the answer: it was rule-sized grey small caps
        * with a text arrow, sitting where a breadcrumb usually sits, and it
        * read as a label rather than as something you press. A control has to
        * look like it can be pressed before anyone finds out that it can.
        *
        * So it is a stitched ring holding an arrow, at the size of a thumb.
        * The ring is the shop's own mark (see components/Logo.tsx) put to
        * work: this is the one piece of the identity that can be a button
        * without being decoration. The stitch closes and the arrow steps left
        * on approach, which is the whole animation — a back control that
        * needed a tutorial would be a worse back control.
        */}
      <Link
        href={`/products?category=${encodeURIComponent(product.category)}`}
        aria-label={`Back to all ${product.category}`}
        className="group mb-[clamp(2rem,5vh,3.5rem)] inline-flex items-center gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
      >
        <span aria-hidden="true" className="relative grid h-12 w-12 shrink-0 place-items-center">
          <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full text-thread/45 transition-colors duration-500 group-hover:text-thread">
            <circle
              cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1.4"
              strokeLinecap="round" strokeDasharray="4 5"
              className="origin-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] group-hover:rotate-[-24deg] motion-reduce:transition-none"
            />
          </svg>
          <ArrowLeft
            size={17}
            className="text-graphite-muted transition-all duration-500 group-hover:-translate-x-0.5 group-hover:text-thread motion-reduce:transition-none"
          />
        </span>
        <span className="text-rule uppercase text-graphite-faint transition-colors duration-500 group-hover:text-thread">
          All {product.category}
        </span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Image/Video Carousel ── */}
        <div>
          <ProductCarousel
            images={product.images || []}
            videoUrl={product.video_url}
            videoOrientation={product.video_orientation}
            name={product.name}
            category={product.category}
            seed={product.id}
          />
        </div>

        {/* ── Product details ── */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <p className="text-maroon-600 font-medium text-sm">{product.category}</p>
            {/* Wishlist */}
            <button
              onClick={() => { if (!user) { promptLogin('Sign in to save products to your wishlist.'); return; } toggleWishlist(product.id); }}
              className={`transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread ${isWishlisted ? 'text-thread-deep' : 'text-graphite-faint hover:text-thread'}`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={19} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
          <h1 className="font-display text-chapter font-normal leading-[1.04] text-graphite">{product.name}</h1>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {/* A green pill with a white star is the marketplace's badge.
                  A rating is a measurement, so it is set as one. */}
              <span className="flex items-center gap-1.5 text-caption uppercase tabular-nums text-thread">
                <Star size={12} className="fill-thread" /> {product.rating_avg.toFixed(1)}
              </span>
              <span className="text-caption uppercase text-graphite-faint">
                {product.rating_count} rating{product.rating_count !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-display text-chapter font-normal tabular-nums text-graphite">₹{product.price.toLocaleString()}</span>
            {product.compare_price && (
              <span className="text-lg tabular-nums text-graphite-faint line-through">₹{product.compare_price.toLocaleString()}</span>
            )}
            {discount && <span className="text-caption uppercase text-thread">{discount}% off</span>}
          </div>
          <p className="text-xs text-graphite-faint mb-5">Inclusive of all taxes. Delivered to your doorstep</p>



          {/**
            * THE SPEC OF THE CLOTH.
            *
            * This was three tiles, each a different pastel gradient with a
            * border and an emoji — thread, scissors, a leaf — above a tiny
            * uppercase label. It is the most useful information on the page
            * for someone deciding whether a garment will suit them, and it was
            * dressed as party favours.
            *
            * A specification is a table. Label above value, ruled, aligned,
            * nothing else.
            */}
          {(product.fabric || product.fit || product.material) && (
            <dl className="mb-6 grid grid-cols-3 gap-x-6 border-t border-paper-edge pt-5">
              {([
                ['Fabric', product.fabric],
                ['Fit', product.fit],
                ['Material', product.material],
              ] as const).map(([label, value]) => value ? (
                <div key={label}>
                  <dt className="text-rule uppercase text-graphite-faint">{label}</dt>
                  <dd className="mt-2 text-graphite">{value}</dd>
                </div>
              ) : <div key={label} />)}
            </dl>
          )}

          {/* Size */}
          {product.size_options && product.size_options.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Size</label>
                {sizeErr && <span className="text-caption uppercase text-thread-deep">Choose one</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.size_options.map((size) => (
                  <button key={size} onClick={() => { setSelectedSize(size); setSizeErr(false); }}
                    className={`min-w-[3.25rem] border px-4 py-2.5 text-caption uppercase transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread ${selectedSize === size ? 'border-graphite bg-graphite text-paper' : 'border-paper-edge text-graphite-muted hover:border-thread hover:text-thread'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Colour</label>
                {colorErr && <span className="text-caption uppercase text-thread-deep">Choose one</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button key={color} onClick={() => { setSelectedColor(color); setColorErr(false); }}
                    className={`border px-4 py-2.5 text-caption uppercase transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread ${selectedColor === color ? 'border-graphite bg-graphite text-paper' : 'border-paper-edge text-graphite-muted hover:border-thread hover:text-thread'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="label">Quantity</label>
            {/* One ruled control, not two boxes and a number floating between
                them. The count is set in the display face because it is the
                number, and the two steppers are hairline-divided cells of the
                same object. */}
            <div className="flex items-center gap-5">
              <div className="inline-flex items-stretch border border-paper-edge">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="One fewer"
                  className="w-11 py-2 text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-thread"
                >
                  &minus;
                </button>
                <span className="flex w-12 items-center justify-center border-x border-paper-edge font-display text-[1.15rem] tabular-nums text-graphite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  aria-label="One more"
                  className="w-11 py-2 text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-thread"
                >
                  +
                </button>
              </div>
              <span className="text-caption uppercase tabular-nums text-graphite-faint">{product.stock} on the shelf</span>
            </div>
          </div>

          {/* Stock warnings */}
          {product.stock === 0 ? (
            <div className="border-l-2 border-critical/50 pl-4 p-4 mb-4 text-critical text-sm font-medium">
              This product is currently out of stock. Check back later.
            </div>
          ) : product.stock <= 5 ? (
            <p className="mb-4 border-l border-thread pl-4 text-sm text-graphite-muted">
              Only {product.stock} left on the shelf.
            </p>
          ) : null}

          {/* Buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
              <ShoppingCart size={18} />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow} disabled={adding || product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
              Buy Now
            </button>
          </div>

          {/* Non-returnable banner */}
          {product.is_returnable === false && (
            <div className="mb-4 border-l border-thread-deep pl-4">
              <p className="text-rule uppercase text-thread-deep">Non-returnable</p>
              <p className="mt-2 text-sm text-graphite-muted">
                Once delivered, this piece cannot be returned, exchanged or replaced.
              </p>
            </div>
          )}

          {/* Trust badges */}
          <dl className="mb-6 border-t border-paper-edge">
            {[
              { term: 'Delivery', value: `5–7 business days, ₹${STORE.shippingFee} flat`, href: '/shipping' },
              product.is_returnable === false
                ? { term: 'Returns', value: 'This piece cannot be returned or exchanged', href: '/cancellation' }
                : { term: 'Returns', value: 'Return within 4 hours of delivery, exchange within 12', href: '/cancellation' },
              { term: 'The cloth', value: 'Sourced direct from the weaver, checked before dispatch', href: '/authentic' },
            ].map(({ term, value, href }) => (
              <Link
                key={term}
                href={href}
                className="group grid grid-cols-[7rem_1fr] items-baseline gap-x-4 border-b border-paper-edge py-3.5 transition-colors duration-500 hover:border-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
              >
                <dt className="text-rule uppercase text-graphite-faint transition-colors duration-500 group-hover:text-thread">{term}</dt>
                <dd className="text-sm text-graphite-muted">{value}</dd>
              </Link>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Tabs ── */}
      {/* No box around the tabs, and no tinted active tab. The rule under the
          selected label is the whole indicator — the same rule the shelf
          filter and the rail use, so selection reads one way site-wide. */}
      <div id="reviews" className="mt-[clamp(3rem,9vh,6rem)] scroll-mt-28">
        <div className="flex gap-8 overflow-x-auto border-b border-paper-edge">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`-mb-px whitespace-nowrap border-b py-4 text-caption uppercase transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread ${tab === t.key ? 'border-thread text-thread' : 'border-transparent text-graphite-faint hover:text-graphite'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="pt-9">
          {/* Description tab */}
          {tab === 'desc' && (
            <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
              <p className="max-w-[68ch] text-lede leading-relaxed text-graphite-muted lg:col-span-7">
                {product.description}
              </p>

              {/* The rest of the specification, in the same register as the
                  one beside the price — a ruled definition list, not seven
                  tinted tiles restating three facts you have already read. */}
              <dl className="lg:col-span-4 lg:col-start-9">
                {([
                  ['Category', product.category],
                  ['Sizes', product.size_options?.length ? product.size_options.join(', ') : null],
                  ['Colours', product.colors?.length ? product.colors.join(', ') : null],
                  ['On the shelf', product.stock > 0 ? `${product.stock}` : 'Sold out'],
                ] as const).filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[8rem_1fr] items-baseline gap-x-4 border-b border-paper-edge py-3.5 first:border-t">
                    <dt className="text-rule uppercase text-graphite-faint">{label}</dt>
                    <dd className="text-sm text-graphite">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Fit & Care tab */}
          {tab === 'care' && (
            <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
              <dl className="lg:col-span-5">
                {([
                  ['Fit', product.fit],
                  ['Fabric', product.fabric],
                  ['Composition', product.material],
                ] as const).filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="border-b border-paper-edge py-5 first:border-t">
                    <dt className="text-rule uppercase text-graphite-faint">{label}</dt>
                    <dd className="mt-2 text-lede text-graphite">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="lg:col-span-6 lg:col-start-7">
                {product.care_instructions && (
                  <>
                    <h3 className="text-rule uppercase text-thread">Caring for this piece</h3>
                    <ul className="mt-5 space-y-3">
                      {product.care_instructions.split(/[.\n]+/).filter(x => x.trim()).map((instruction, i) => (
                        <li key={i} className="relative pl-6 text-graphite-muted before:absolute before:left-0 before:top-[0.8em] before:h-px before:w-3 before:bg-thread/70">
                          {instruction.trim()}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h3 className={`text-rule uppercase text-graphite-faint ${product.care_instructions ? 'mt-10' : ''}`}>
                  True of everything we sell
                </h3>
                <ul className="mt-5 space-y-3">
                  {[
                    'Wash dark colours separately for the first few washes.',
                    'Turn the garment inside out before washing to keep the colour.',
                    'Do not soak for long periods.',
                    'Store cool and dry, out of direct sunlight.',
                  ].map((tip) => (
                    <li key={tip} className="relative pl-6 text-graphite-muted before:absolute before:left-0 before:top-[0.8em] before:h-px before:w-3 before:bg-paper-edge">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Reviews tab */}
          {tab === 'reviews' && (
            <div className="space-y-6">
              {!user && (
                <div className="border-l border-paper-edge pl-5">
                  <p className="text-graphite-muted">
                    Bought this piece?{' '}
                    <Link href="/auth/login" className="text-graphite underline decoration-thread/50 underline-offset-4 transition-colors duration-500 hover:decoration-thread">
                      Sign in
                    </Link>{' '}
                    to say how it wore.
                  </p>
                </div>
              )}

              {user && canReview && (
                <div className="border-l border-thread pl-5 sm:pl-7">
                  <h3 className="text-rule uppercase text-thread">How did it wear?</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <p className="text-sm text-graphite-muted mb-2">Your rating *</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} type="button"
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setMyRating(n)}
                            className="focus:outline-none"
                          >
                            <Star size={30} strokeWidth={1.25} className={(hoverRating || myRating) >= n ? 'fill-thread text-thread' : 'text-paper-edge'} />
                          </button>
                        ))}
                        {myRating > 0 && (
                          <span className="ml-2 text-sm text-graphite-muted self-center">
                            {['','Poor','Fair','Good','Very Good','Excellent'][myRating]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="label">Review title (optional)</label>
                      <input type="text" value={myTitle} onChange={e => setMyTitle(e.target.value)}
                        placeholder="e.g. Great quality fabric!" className="input-field" maxLength={100} />
                    </div>
                    <div>
                      <label className="label">Your review *</label>
                      <textarea value={myComment} onChange={e => setMyComment(e.target.value)}
                        placeholder="Share your experience with this product — quality, fit, colour, delivery..."
                        className="input-field resize-none" rows={4} maxLength={1000} />
                      <p className="text-xs text-graphite-faint mt-1">{myComment.length}/1000 characters</p>
                    </div>
                    <button type="submit" disabled={submitting || myRating === 0}
                      className="btn-primary flex items-center gap-2 py-2.5 px-6 disabled:opacity-60">
                      {submitting ? 'Submitting...' : <><Send size={16} /> Submit Review</>}
                    </button>
                  </form>
                </div>
              )}

              {user && !canReview && reviewReason === 'not_purchased' && (
                <div className="bg-paper border border-paper-edge rounded-sm p-4">
                  <p className="text-sm text-graphite-muted">
                    🛡️ <strong>Only verified buyers</strong> who have received this product can leave a review.
                    <Link href="/products" className="text-maroon-700 hover:underline ml-1">Purchase it to review.</Link>
                  </p>
                </div>
              )}
              {user && !canReview && reviewReason === 'already_reviewed' && (
                <div className="border-l-2 border-positive/50 pl-4 p-4">
                  <p className="text-sm text-positive flex items-center gap-2">
                    <CheckCircle size={16} /> You have already reviewed this product. Thank you!
                  </p>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {product && product.rating_count > 0 && (
                    <div className="mb-10 grid gap-x-14 gap-y-8 border-y border-paper-edge py-8 sm:grid-cols-[auto_1fr]">
                      <div>
                        <p className="font-display text-chapter leading-none tabular-nums text-graphite">
                          {product.rating_avg.toFixed(1)}
                          <span className="text-band text-graphite-faint">/5</span>
                        </p>
                        <p className="mt-3 text-rule uppercase tabular-nums text-graphite-faint">
                          {product.rating_count} rating{product.rating_count !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* The distribution, so an average cannot hide a tail. */}
                      <div className="flex flex-col justify-center gap-2">
                        {[5,4,3,2,1].map(star => {
                          const cnt = reviews.filter(r => r.rating === star).length;
                          const pct = reviews.length ? Math.round((cnt / reviews.length) * 100) : 0;
                          return (
                            <div key={star} className="grid grid-cols-[1.5rem_1fr_2rem] items-center gap-3">
                              <span className="text-rule tabular-nums text-graphite-faint">{star}</span>
                              <span className="h-px bg-paper-edge">
                                <span
                                  className="block h-px bg-thread transition-[width] duration-700 ease-out"
                                  style={{ width: `${pct}%` }}
                                />
                              </span>
                              <span className="text-rule tabular-nums text-graphite-faint">{cnt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {reviews.map((r) => (
                    <div key={r.id} className="grid gap-x-10 gap-y-3 border-b border-paper-edge py-7 last:border-0 sm:grid-cols-[12rem_1fr]">
                      <div>
                        <p className="text-graphite">{r.user.full_name}</p>
                        <p className="mt-1.5 text-rule uppercase tabular-nums text-thread">{r.rating}/5</p>
                        <p className="mt-1.5 text-rule uppercase text-graphite-faint">
                          {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        {r.title && <p className="font-display text-[1.1rem] text-graphite">{r.title}</p>}
                        {r.comment && <p className="mt-2 max-w-[68ch] leading-relaxed text-graphite-muted">{r.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-graphite-faint">
                  <p className="text-rule uppercase text-graphite-faint">Nothing written yet</p>
                  <p className="mt-3 max-w-[52ch] text-graphite-muted">When someone who bought this piece writes about how it wore, it appears here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
