/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fafaf5',
          100: '#f5f1e8',
          200: '#ffe4cc',
          300: '#ffd4a3',
          400: '#ffb84d',
          500: '#ff9800',
          600: '#e07a00',
          700: '#b85900',
          800: '#934000',
          900: '#6b2e00',
          950: '#3d1a00'
        },
        slate: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        gutter: 'clamp(1rem, 5vw, 5rem)',
        section: 'clamp(3rem, 10vw, 8rem)',
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '20px',
        full: '9999px'
      },
      boxShadow: {
        sm: '0 2px 12px rgba(0,0,0,0.06)',
        md: '0 8px 32px rgba(0,0,0,0.10)',
        lg: '0 20px 60px rgba(0,0,0,0.14)',
        xl: '0 24px 48px rgba(0,0,0,0.18)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-in-out',
        slideUp: 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [],
  safelist: [
    'bg-orange-500',
    'text-orange-500',
    'border-orange-500',
    'hover:bg-orange-600',
    'dark:bg-slate-900'
  ]
}
