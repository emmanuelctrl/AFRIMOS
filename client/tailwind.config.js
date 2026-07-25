/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // xs added ahead of the defaults so the min-width cascade stays correct.
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Crimson accent that drives the whole dark theme. Swap these values
        // (and nothing else) to re-tint the entire app.
        brand: {
          50: '#fff1f2',
          100: '#ffe0e3',
          200: '#ffc6cc',
          300: '#ff9ba6',
          400: '#f65f6f',
          500: '#e11d3a',
          600: '#c20e2b',
          700: '#a30d25',
          800: '#871024',
          900: '#711223',
          950: '#3e050d',
        },
        accent: {
          400: '#f0b429',
          500: '#de911d',
          600: '#cb6e17',
        },
        // Near-black surface tokens for the dark UI.
        ink: {
          900: '#0a0a0a',
          800: '#101012',
          700: '#16161a',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-lg': '0 20px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
      },
    },
  },
  plugins: [],
};
