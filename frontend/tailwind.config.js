/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Ammalu Tex — "Pearl Rose" luxury palette
        /**
         * THE ATELIER — Ammalu Tex's own system, and deliberately the inverse
         * of the sister shop's.
         *
         * Vijey Textile is a dark heirloom room at night: near-black ground,
         * brass appearing rarely enough to still read as metal, off-white type.
         * Ammalu Tex is a tailoring workroom in daylight. Its canvas already
         * paints that — the atelier scene's own values are #F6ECE9, #F1DCD2,
         * #E2CDC6 — and until now the DOM sat on top of it in maroon, opaque,
         * hiding the room completely. These tokens are taken FROM the scene so
         * the page and the canvas are the same room rather than two.
         *
         * One accent, and it is thread. Not gold, not maroon: the terracotta
         * already spooled through the scene (#C1876F). Used on rules, on the
         * live link, on the one number that matters — never as a fill.
         */
        paper: {
          DEFAULT: '#FAF6F3',   // the ground: unbleached pattern paper
          bright:  '#FFFDFB',   // lifted card, the light off the window
          shade:   '#F1E7E1',   // muslin, a surface set back
          edge:    '#E1D2C9',   // hairlines, the fold in the paper
        },
        thread: {
          DEFAULT: '#C1876F',   // the only accent
          deep:    '#A4664D',   // hover, pressed, the pulled stitch
          pale:    '#E3BCAC',   // tacking thread, dividers
        },
        /**
         * THE DYE BOX.
         *
         * The site had exactly one accent, and the criticism it earned was
         * fair: six categories set as six identical ruled rows in one colour
         * read as a table of contents, not a shelf. The instinct in that
         * situation is to reach for a colour ramp — and that is how a design
         * gets a rainbow that means nothing.
         *
         * So these are not decoration and they are not chosen for variety.
         * They are the six natural dyes a South Indian textile shop actually
         * works with, each assigned to the category it most often colours:
         * indigo, madder, turmeric, lac, myrobalan, pomegranate rind. Every
         * one is desaturated and earth-weighted, so they sit WITH the paper
         * and the thread rather than shouting over them — the difference
         * between a dye lot and a swatch fan.
         *
         * Because they carry meaning, they are used where the meaning lands:
         * the selvedge edge of each row on the shelf, and nowhere else. A
         * dye that turns up on a button has stopped being a dye.
         */
        dye: {
          indigo:      '#2E4A62',   // Chudithar   — the everyday blue
          madder:      '#9E3B35',   // Lehenga     — the wedding red
          turmeric:    '#C68A1E',   // Half Saree  — the ceremony yellow
          lac:         '#7C2E4A',   // Party Wears — the deep evening
          myrobalan:   '#7C7A4E',   // Tops        — the quiet olive
          pomegranate: '#B5643C',   // Crop Tops   — the newer rust
        },
        /**
         * THE THREE SEMANTIC TONES.
         *
         * Customer-facing pages carried 586 references to Tailwind's default
         * ramps across SIXTEEN hue families — red, green, blue, purple, teal,
         * cyan, indigo, orange, amber, yellow, rose, emerald and more. The
         * return-status map alone spent EIGHT hues on eleven states, which is
         * not information design: nobody learns eight hues, and the label
         * beside the chip already says which state it is.
         *
         * A status colour only has to answer one question at a glance — is
         * this good, bad, needs-attention, or simply in flight. So there are
         * three tones plus the neutral, and every state maps onto one of them.
         * The eleven labels keep saying the eleven things.
         *
         * Chosen inside this shop's warm family rather than borrowed from a
         * generic ramp — desaturated, warm-biased, so a "delivered" chip sits
         * on the paper ground instead of shouting off it. All three measure
         * AA or better on all three grounds (paper 5.68/5.59/6.45:1) and each
         * `deep` on its own `soft` clears AAA.
         *
         * `soft` is only ~1.1:1 against the page ground, so anything using it
         * as a chip ground takes the matching border to carry the edge.
         */
        positive: { soft: '#EDF1E7', DEFAULT: '#55683F', deep: '#3E4C2E' },
        caution:  { soft: '#F7EFE0', DEFAULT: '#7D5E23', deep: '#5E461A' },
        critical: { soft: '#F9E9E5', DEFAULT: '#94402E', deep: '#6F2F22' },
        graphite: {
          DEFAULT: '#332722',   // type — the tailor's pencil
          muted:   '#6F5F58',   // secondary
          faint:   '#9C8B83',   // tertiary, annotation
        },
        /**
         * THE LEGACY SCALE, REMAPPED ONTO THE ATELIER.
         *
         * `maroon-*` and `gold-*` are used 300+ times across fourteen pages —
         * the navigation alone has sixty-four. Rewriting every call site would
         * be a fortnight of mechanical edits with a real chance of missing one
         * and leaving a wine-coloured button in the middle of a paper-coloured
         * shop.
         *
         * Remapping the SCALE does it in one move, and it is safe because the
         * light-to-dark ORDER is preserved: anything that was readable as
         * dark-on-light or light-on-dark still is. 50 is the palest paper, 900
         * is the tailor's pencil, and the middle of the ramp is the thread.
         *
         * The names now lie — nothing here is maroon — and that is the cost.
         * They are kept rather than renamed so that this remains ONE diff
         * rather than one diff plus three hundred, and so a page written
         * against the old names cannot silently break. New work should use
         * `paper`, `thread` and `graphite` directly; these exist to carry the
         * pages that predate them.
         */
        maroon: {
          50:  '#FFFDFB',   // paper.bright  — the light off the window
          100: '#FAF6F3',   // paper         — the ground
          200: '#F1E7E1',   // paper.shade   — muslin, a surface set back
          300: '#E1D2C9',   // paper.edge    — hairlines, the fold
          400: '#E3BCAC',   // thread.pale   — tacking thread
          500: '#C1876F',   // thread        — the accent
          600: '#A4664D',   // thread.deep   — hover, the pulled stitch
          700: '#8A5340',   // deepest thread, for a filled button
          800: '#6F5F58',   // graphite.muted
          900: '#332722',   // graphite      — type
          950: '#1F1714',   // deepest, for the rare inversion
        },
        // Same treatment: the old blush-tan ramp now reads as unbleached
        // cloth warming toward thread. Kept for the same reason as above.
        gold: {
          50:  '#FDFAF8',
          100: '#F8F1EC',
          200: '#F1E7E1',
          300: '#E7D6CC',
          400: '#DCC0B1',
          500: '#C1876F',
          600: '#A4664D',
          700: '#8A5340',
          800: '#63483B',
          900: '#3E2E27',
        },
      },
      /**
       * The atelier scale. Smaller and more precise than the sister shop's —
       * that one opens with a sentence at 9vw because it is staging an
       * heirloom; this one is a workroom, and a workroom is annotated rather
       * than announced. The eyebrow and rule sizes carry real letter-spacing
       * because they are labels on a pattern piece.
       */
      fontSize: {
        'plate':   ['clamp(2.4rem, min(7.2vw, 10vh), 6.4rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        'chapter': ['clamp(1.9rem, 5vw, 3.6rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'band':    ['clamp(1.5rem, 3.2vw, 2.4rem)', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
        /**
         * DOCUMENT SCALE — for pages that are read rather than looked at.
         *
         * The policy pages were set in `chapter` and `band`, the display
         * steps: at a 1280px window that is a 58px title and a 38px section
         * heading. Measured first, because the complaint was "too much text":
         * no paragraph on /cancellation, /terms, /privacy, /shipping or
         * /authentic exceeds 38 words, and each page is a short opening plus a
         * list. There was no prose to cut. What made them feel long was that
         * every heading was sized to be LOOKED at, so a page with 60 words on
         * it filled two screens and the answer sat below the fold.
         *
         * 34px and 22px at 1280px — unmistakably headings, and nothing more.
         * Kept a step below the sister shop's equivalents, which is the same
         * relationship the two display scales already have.
         */
        'doc':     ['clamp(1.6rem, 2.7vw, 2.15rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
        'doc-head':['clamp(1.1rem, 1.7vw, 1.38rem)', { lineHeight: '1.25', letterSpacing: '-0.005em' }],
        'lede':    ['clamp(1rem, 1.35vw, 1.18rem)', { lineHeight: '1.68', letterSpacing: '0' }],
        'caption': ['0.76rem', { lineHeight: '1.5', letterSpacing: '0.12em' }],
        'rule':    ['0.66rem', { lineHeight: '1.3', letterSpacing: '0.24em' }],
      },
      fontFamily: {
        sans:    ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #b3735f 0%, #6c463b 100%)',
        'gold-gradient': 'linear-gradient(135deg, #e2cdc6 0%, #f6ece9 50%, #e2cdc6 100%)',
      },
    },
  },
  plugins: [],
};
