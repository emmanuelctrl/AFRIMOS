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
        // Surfaces — deep blue-teal, like a wet road at night
        base: {
          DEFAULT: '#0A141A',
          900: '#0A141A',
          800: '#102028',
          700: '#172E38',
          600: '#1F3B47',
        },
        espresso: {
          900: '#0A141A',
          800: '#102028',
          700: '#172E38',
          600: '#89A0AC',
          500: '#A9BDC7',
        },
        ink: {
          900: '#0A141A',
          800: '#102028',
          700: '#172E38',
        },
        // Signal red — CTAs, active nav, progress
        electric: {
          300: '#FF7A72',
          400: '#F5453A',
          500: '#E5231B',
          600: '#C4160F',
          700: '#96100B',
        },
        // Cool white gradient for display type
        silver: {
          100: '#FFFFFF',
          200: '#E6EEF2',
          300: '#C2D2DA',
          400: '#94A9B4',
          500: '#6B818D',
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
        glass: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-lg': '0 20px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        glow: '0 0 50px rgba(229, 35, 27, 0.14)',
        'glow-cyan': '0 0 40px rgba(229, 35, 27, 0.30)',
        'glow-purple': '0 0 40px rgba(245, 69, 58, 0.25)',
        'glow-blue': '0 10px 34px rgba(229, 35, 27, 0.45)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(120deg, #F5453A 0%, #E5231B 50%, #C4160F 100%)',
        'gradient-silver':
          'linear-gradient(180deg, #FFFFFF 0%, #E6EEF2 40%, #C2D2DA 75%, #94A9B4 100%)',
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
