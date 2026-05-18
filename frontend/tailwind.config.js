/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50:  '#fdf2f5',
          100: '#fce7ec',
          200: '#f9d0db',
          300: '#f4abbe',
          400: '#ec7899',
          500: '#e04f76',
          600: '#cb2f56',
          700: '#aa2045',
          800: '#8b1538',
          900: '#761030',
          950: '#420819',
        },
        gold: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#c8860a',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #8b1538 0%, #5c0f25 100%)',
        'gold-gradient': 'linear-gradient(135deg, #c8860a 0%, #eab308 100%)',
      },
    },
  },
  plugins: [],
};
