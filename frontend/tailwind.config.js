/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Ammalu Tex — "Pearl Rose" luxury palette
        maroon: {
          50:  '#fbf5f3',
          100: '#f6ece9',
          200: '#eeddd8',
          300: '#e2cdc6',
          400: '#c2a29a',
          500: '#99786f',
          600: '#6f544c',
          700: '#4f3a33',
          800: '#33231e',
          900: '#2a1a18',
          950: '#180f0d',
        },
        gold: {
          50:  '#faf0ec',
          100: '#f1dcd2',
          200: '#e3bcac',
          300: '#d59d89',
          400: '#c1876f',
          500: '#b3735f',
          600: '#8f5c4c',
          700: '#6c463b',
          800: '#4a302a',
          900: '#301f1a',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #b3735f 0%, #6c463b 100%)',
        'gold-gradient': 'linear-gradient(135deg, #e2cdc6 0%, #f6ece9 50%, #e2cdc6 100%)',
      },
    },
  },
  plugins: [],
};
