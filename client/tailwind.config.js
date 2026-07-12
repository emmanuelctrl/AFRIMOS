/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8f4',
          100: '#dfeee4',
          200: '#c1ddcc',
          300: '#96c4aa',
          400: '#68a584',
          500: '#478867',
          600: '#356d51',
          700: '#2b5742',
          800: '#254637',
          900: '#1f3a2e',
          950: '#102019',
        },
        accent: {
          400: '#f0b429',
          500: '#de911d',
          600: '#cb6e17',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(16, 32, 25, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
        'glass-lg': '0 20px 48px rgba(16, 32, 25, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
      },
    },
  },
  plugins: [],
};
