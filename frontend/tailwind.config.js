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
