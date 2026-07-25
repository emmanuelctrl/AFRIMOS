/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
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
        // Surfaces — dark cream. NOTE: this is a light theme, so the scale runs
        // *lighter* as the number grows: `base-900` is the page background and
        // `base-700`/`600` are the raised cards. Kept in this direction so the
        // existing `bg-base-900` / `bg-base-800` usages keep their meaning.
        base: {
          DEFAULT: '#E7DAC4',
          900: '#E7DAC4',
          800: '#EFE4D2',
          700: '#F5ECDF',
          600: '#FBF6EC',
        },
        // Espresso — all text and dark surfaces
        espresso: {
          900: '#2A1D12',
          800: '#3D2C1C',
          700: '#5C4632',
          600: '#7A6248',
          500: '#96805F',
        },
        ink: {
          900: '#2A1D12',
          800: '#3D2C1C',
          700: '#5C4632',
        },
        // Roasted caramel — the accent. Darkened from the dark-theme values so
        // it still meets contrast on a cream background.
        electric: {
          300: '#C98B45',
          400: '#B0722F',
          500: '#8F5A22',
          600: '#6F461B',
          700: '#523213',
        },
        // Espresso gradient for the display wordmark (was latte foam on dark)
        silver: {
          100: '#3D2C1C',
          200: '#4E3A26',
          300: '#6B5238',
          400: '#8A7357',
          500: '#A89170',
        },
        // `brand` stays mapped so existing app screens keep working.
        brand: {
          50: '#fdf8f2',
          100: '#f7ebdc',
          200: '#eed6b9',
          300: '#E3B778',
          400: '#D49A5A',
          500: '#B87333',
          600: '#96602A',
          700: '#6F461F',
          800: '#4E3217',
          900: '#33210F',
          950: '#1C1108',
        },
        accent: {
          400: '#D49A5A',
          500: '#B87333',
          600: '#96602A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
      },
      boxShadow: {
        // Warm, soft shadows — black shadows look dirty on cream
        glass: '0 8px 28px rgba(74, 52, 32, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'glass-lg': '0 20px 44px rgba(74, 52, 32, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        glow: '0 0 50px rgba(143, 90, 34, 0.10)',
        'glow-cyan': '0 0 40px rgba(143, 90, 34, 0.22)',
        'glow-purple': '0 0 40px rgba(176, 114, 47, 0.20)',
        'glow-blue': '0 10px 30px rgba(143, 90, 34, 0.30)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(120deg, #B0722F 0%, #8F5A22 45%, #6F461B 100%)',
        // Espresso display gradient used by the giant wordmark
        'gradient-silver':
          'linear-gradient(180deg, #3D2C1C 0%, #4E3A26 38%, #6B5238 72%, #A89170 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        noise:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(4%, -6%, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-4%, 4%, 0) scale(0.96)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        aurora: 'aurora 22s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        marquee: 'marquee var(--marquee-duration, 40s) linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
      },
    },
  },
  plugins: [],
};
