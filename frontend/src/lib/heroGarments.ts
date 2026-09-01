/**
 * The photographs that appear in the opening.
 *
 * WHY THIS FILE EXISTS RATHER THAN THE OPENING PICKING FOR ITSELF. The
 * catalogue photographs are taken to sit in a grid at postage-stamp size. The
 * opening is nearly a metre wide on a desktop, and a catalogue shot blown up
 * that far looks like exactly what it is. The opening wants photographs taken
 * for it, and only a person can choose those.
 *
 * IT IS EMPTY, AND THAT IS A WORKING STATE. With nothing listed here the
 * opening falls back to the shop's own product photographs, filtered by shape
 * so a collage or a close-up cannot land in it. Those photographs happen to be
 * unusually good for this — full-length, on the model, portrait — so the
 * fallback is genuinely presentable rather than a placeholder. It is still a
 * fallback: only four of nineteen pieces are photographed, so the opening
 * currently rotates through four.
 *
 * HOW TO USE IT
 *
 *   1. Put the images in `frontend/public/hero/`.
 *   2. List them below, in the order they should appear.
 *   3. Anything listed here replaces the product fallback entirely.
 *
 * WHAT MAKES A GOOD ONE
 *
 *   PORTRAIT, ABOUT 3:4. The opening is a wide band, so a portrait photograph
 *   is cropped to a middle slice. Leave room above and below the piece so the
 *   crop lands on background rather than through the garment.
 *
 *   ROOM ON THE LEFT. The headline sits over the left third under a wash. A
 *   photograph with its subject hard left will be half-covered by type.
 *
 *   1200px WIDE AT LEAST. Below that the browser is stretching rather than
 *   choosing, and it goes soft across a desktop band.
 */
export const HERO_GARMENTS: string[] = [
  // '/hero/opening-01.jpg',
  // '/hero/opening-02.jpg',
];
