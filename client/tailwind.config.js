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
        // Surfaces — dark-mode first
        base: {
          DEFAULT: '#090D16',
          900: '#090D16',
          800: '#111827',
          700: '#161B26',
          600: '#1D2333',
        },
        ink: {
          900: '#090D16',
          800: '#111827',
          700: '#161B26',
        },
        // Accents — electric cyan / deep blue / neon purple / indigo
        cyan: {
          DEFAULT: '#22D3EE',
          400: '#22D3EE',
          500: '#06B6D4',
        },
        neon: {
          purple: '#A855F7',
          violet: '#8B5CF6',
          indigo: '#6366F1',
          blue: '#3B82F6',
        },
        // `brand` stays mapped so existing app screens keep working.
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        accent: {
          400: '#A855F7',
          500: '#8B5CF6',
          600: '#6366F1',
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
        glow: '0 0 50px rgba(0, 255, 255, 0.08)',
        'glow-cyan': '0 0 40px rgba(34, 211, 238, 0.25)',
        'glow-purple': '0 0 40px rgba(168, 85, 247, 0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(120deg, #22D3EE 0%, #3B82F6 50%, #A855F7 100%)',
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
