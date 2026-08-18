/**
 * What a piece looks like while it is being fetched.
 *
 * WHY THIS FILE EXISTS. Tapping a product used to do nothing visible for as
 * long as the route chunk took to arrive and the product to load — the old
 * page stayed on screen, apparently ignoring the tap, and then the new one
 * replaced it whole. On a good connection that is a stutter; on a phone on
 * mobile data it is long enough to tap again.
 *
 * Next's App Router streams this the instant navigation starts, before any
 * data is requested, so the response to the tap is immediate and the layout
 * that arrives is the one already on screen — the plate settles into place
 * rather than appearing from nothing.
 *
 * It mirrors the real page's proportions exactly (3/5 gallery, 2/5 column,
 * same aspect ratio, same rhythm). A skeleton whose shape differs from the
 * page it precedes makes the arrival WORSE than no skeleton, because the
 * layout visibly jumps at the moment the content lands.
 *
 * No spinner. A spinner says "something is happening somewhere"; a shape says
 * "your piece is arriving, and it will be here".
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* The way back, held in place so it does not pop in. */}
      <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-center gap-4">
        <span className="block h-12 w-12 rounded-full bg-paper-shade" />
        <span className="block h-3 w-28 bg-paper-shade" />
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="aspect-square w-full animate-pulse bg-paper-shade" />
          <div className="mt-4 flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="block aspect-square w-16 bg-paper-shade" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <span className="block h-3 w-24 bg-paper-shade" />
          <span className="mt-5 block h-9 w-4/5 bg-paper-shade" />
          <span className="mt-3 block h-9 w-3/5 bg-paper-shade" />
          <span className="mt-8 block h-7 w-32 bg-paper-shade" />

          <div className="mt-10 flex flex-col gap-3">
            <span className="block h-3 w-full bg-paper-shade" />
            <span className="block h-3 w-11/12 bg-paper-shade" />
            <span className="block h-3 w-9/12 bg-paper-shade" />
          </div>

          <span className="mt-10 block h-12 w-full bg-paper-shade" />
        </div>
      </div>

      <span className="sr-only" role="status">Loading this piece…</span>
    </div>
  );
}
