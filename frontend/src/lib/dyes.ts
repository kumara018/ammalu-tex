/**
 * The dye lot for each category, and the stand-in for a piece not yet
 * photographed.
 *
 * THE PROBLEM THIS SOLVES. Seventeen of nineteen products in this shop have no
 * photograph — they are seed rows whose image paths pointed at a file no
 * service ever served, and a startup routine strips those dead paths rather
 * than render a broken-image glyph. So the database genuinely holds a shop
 * with two photographed pieces and seventeen unphotographed ones.
 *
 * Before the redesign each of those showed a 👗 emoji, which filled the space
 * and hid the fact. The rebuild replaced it with the words "Photograph to
 * come" — more honest, and worse, because a plate of grey text reads as a
 * broken page rather than as a product. The shopkeeper's reaction was the
 * correct one: it looks like the products are not showing.
 *
 * THE ANSWER IS ALREADY IN THE PALETTE. A bolt of cloth on a shelf is
 * identified by its dye long before anyone unfolds it, which is why the
 * homepage rules each category with its own dye. An unphotographed piece is
 * exactly that: a bolt whose colour is known and whose drape is not. So it is
 * shown as its dye — a woven ground in the category's own colour, carrying the
 * name of the piece.
 *
 * That makes a product with no photograph a COMPLETE OBJECT rather than an
 * absence. It is honest (nobody mistakes it for a photograph), it is specific
 * (a Lehenga and a Crop Top look different), and it costs nothing: two CSS
 * gradients and no request.
 *
 * One source of truth: the homepage shelf, the product card, the product
 * gallery, the bag and the order rows all read from here, so a category can
 * never be indigo in one place and madder in another.
 */

export interface Dye {
  /** The dye's own name, as a dyer would say it. */
  name: string;
  /** Tailwind background token for the selvedge on the homepage shelf. */
  band: string;
  /** The two stops the woven ground is built from. */
  from: string;
  to: string;
  /** Type colour that stays legible on that ground. */
  ink: string;
}

const INDIGO: Dye      = { name: 'Indigo',          band: 'bg-dye-indigo',      from: '#2E4A62', to: '#243A4E', ink: '#EAF0F4' };
const MADDER: Dye      = { name: 'Madder',          band: 'bg-dye-madder',      from: '#9E3B35', to: '#7C2C28', ink: '#FAEDEB' };
const TURMERIC: Dye    = { name: 'Turmeric',        band: 'bg-dye-turmeric',    from: '#C68A1E', to: '#A06E14', ink: '#FFF7E6' };
const LAC: Dye         = { name: 'Lac',             band: 'bg-dye-lac',         from: '#7C2E4A', to: '#5F2239', ink: '#FBEBF1' };
const MYROBALAN: Dye   = { name: 'Myrobalan',       band: 'bg-dye-myrobalan',   from: '#7C7A4E', to: '#5F5D3A', ink: '#F7F7EC' };
const POMEGRANATE: Dye = { name: 'Pomegranate',     band: 'bg-dye-pomegranate', from: '#B5643C', to: '#8F4C2C', ink: '#FDF0E9' };

/**
 * Category to dye. Keyed loosely on purpose: the admin form lets a shopkeeper
 * type a category, so this has to survive "Half Saree", "half saree" and
 * "Half-Saree" without a migration.
 */
const BY_CATEGORY: Record<string, Dye> = {
  chudithar: INDIGO,
  lehenga: MADDER,
  'half saree': TURMERIC,
  halfsaree: TURMERIC,
  'party wears': LAC,
  'party wear': LAC,
  tops: MYROBALAN,
  'crop tops': POMEGRANATE,
  'crop top': POMEGRANATE,
};

/**
 * The dye for a category. Anything unrecognised gets myrobalan — the quietest
 * of the six, so a category nobody planned for still looks deliberate rather
 * than defaulting to the loudest colour on the shelf.
 */
export function dyeFor(category?: string | null): Dye {
  if (!category) return MYROBALAN;
  return BY_CATEGORY[category.trim().toLowerCase().replace(/[-_]+/g, ' ')] ?? MYROBALAN;
}

/**
 * THE DYE LOT — why two pieces in the same category are not the same colour.
 *
 * The first version of this returned one exact ground per category, and on a
 * shelf filtered to a single category that is what you saw: three identical
 * mustard rectangles in a row, which looks like one image repeated by mistake
 * rather than like three bolts of cloth. It also walked straight back into the
 * complaint that this shop is "only one colour".
 *
 * Dyeing answers this by itself. Natural dye is a batch process — turmeric
 * from one harvest against another, a vat that has already given up some of
 * its strength, an extra hour in the pot — so two bolts of the same dye from
 * different LOTS never match exactly. Any shopkeeper knows to cut a garment
 * from a single lot for precisely this reason.
 *
 * So the piece's own id picks its lot: a small, deterministic drift in
 * lightness and hue, at a size a dyer would accept as the same colour and an
 * eye still reads as three separate bolts. Deterministic matters — the same
 * piece has to look the same on every visit and on the server as in the
 * browser, so this is arithmetic on the id and never Math.random().
 */
/**
 * The shift is computed into the colour itself rather than applied as a CSS
 * `filter`, which was the first attempt. A filter applies to an element AND
 * its children, so it would have dragged the dye's name and the "not yet
 * photographed" line along with the cloth — tinting type that was chosen to
 * stay legible against it. The cloth shifts; the ink written on it does not.
 */
function shift(hex: string, seed: number): string {
  const n = parseInt(hex.slice(1), 16);
  let [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);

  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  /* A cheap integer hash; the multiplier is Knuth's so neighbouring ids do not
     land on neighbouring lots and a shelf sorted by id does not gradate. */
  const t = Math.abs(Math.imul(seed || 1, 2654435761) % 1000) / 1000 - 0.5;
  const H = (h + t * 7 + 360) % 360;                          // ±3.5° — a different pot
  const L = Math.min(0.94, Math.max(0.06, l + t * 0.07));     // ±3.5% — a fuller or more spent vat

  const c = (1 - Math.abs(2 * L - 1)) * s;
  const x = c * (1 - Math.abs(((H / 60) % 2) - 1));
  const m = L - c / 2;
  const seg = Math.floor(H / 60) % 6;
  const rgb = [
    [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
  ][seg].map((v) => Math.round((v + m) * 255));

  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * The woven ground for an unphotographed piece.
 *
 * Two layers over the dye: a repeating warp and a repeating weft, each a
 * hairline of white at four percent, crossing at 3px. At normal viewing
 * distance that reads as the tooth of a plain weave rather than as a pattern —
 * which is the point. It is cloth, not wallpaper.
 *
 * `backgroundImage` rather than an SVG so it scales to any plate size, prints,
 * and costs no request. `seed` is the product's id; omit it and every piece in
 * a category comes out of the same pot.
 */
export function wovenGround(dye: Dye, seed?: number): React.CSSProperties {
  const from = seed ? shift(dye.from, seed) : dye.from;
  const to = seed ? shift(dye.to, seed) : dye.to;
  return {
    backgroundColor: from,
    backgroundImage: [
      `repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 3px)`,
      `repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)`,
      `linear-gradient(155deg, ${from} 0%, ${to} 100%)`,
    ].join(','),
  };
}
