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
        // Signal — ocean blue: CTAs, active nav, progress.
        // 500 is the fill (5.5:1 under white text); 300 is the on-dark text
        // tone, since 500 is too deep to read against the night base.
        electric: {
          300: '#6FC8E4',
          400: '#2E9CC9',
          500: '#0B6E99',
          600: '#07567A',
          700: '#053E59',
        },
        // Cream / beige — the warm counterweight to all that ocean.
        cream: {
          50: '#FCF9F2',
          100: '#F6EFE0',
          200: '#EADFC7',
          300: '#D9CBAD',
          400: '#BEAF8F',
          500: '#9C8E72',
          600: '#786C55',
        },
        // Warm off-white in place of pure white, so every hairline, label and
        // ghost surface picks up a little cream without any extra markup.
        white: '#FCFAF4',
        // Body-copy ramp, warmed off Tailwind's cool default greys. Only the
        // shades this app actually uses are overridden; the rest fall through.
        gray: {
          100: '#F3EDE1',
          200: '#E4DAC7',
          300: '#CEC3AC',
          400: '#A79C86',
          500: '#7F7563',
        },
        // Warm metal gradient for display type
        silver: {
          100: '#FCFAF4',
          200: '#F1E9DA',
          300: '#DED2BA',
          400: '#B3A88F',
          500: '#8A8069',
        },
        // `brand` stays mapped so the existing app screens keep working — now
        // on the same ocean ramp as the marketing site, not the old copper.
        brand: {
          50: '#F0F9FD',
          100: '#D7F0FA',
          200: '#AEE1F2',
          300: '#6FC8E4',
          400: '#2E9CC9',
          500: '#0B6E99',
          600: '#095A7F',
          700: '#074761',
          800: '#053345',
          900: '#04222E',
          950: '#02141B',
        },
        accent: {
          400: '#2E9CC9',
          500: '#0B6E99',
          600: '#095A7F',
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
        glow: '0 0 50px rgba(11, 110, 153, 0.18)',
        'glow-cyan': '0 0 40px rgba(46, 156, 201, 0.32)',
        'glow-purple': '0 0 40px rgba(111, 200, 228, 0.24)',
        'glow-blue': '0 10px 34px rgba(11, 110, 153, 0.48)',
        'glow-cream': '0 10px 40px rgba(234, 223, 199, 0.20)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(120deg, #2E9CC9 0%, #0B6E99 55%, #07567A 100%)',
        'gradient-cream': 'linear-gradient(120deg, #FCF9F2 0%, #F6EFE0 50%, #D9CBAD 100%)',
        'gradient-silver':
          'linear-gradient(180deg, #FCF9F2 0%, #F1E9DA 40%, #DED2BA 75%, #B3A88F 100%)',
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
