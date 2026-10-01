/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          purple: '#a855f7',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { transform: 'scaleY(0.4)' },
          '100%': { transform: 'scaleY(1.2)' },
        }
      },
      borderRadius: {
        lg: 'var(--radius, 0.5rem)',
        md: 'calc(var(--radius, 0.5rem) - 2px)',
        sm: 'calc(var(--radius, 0.5rem) - 4px)',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents, theme }) {
      // Custom focus-visible utilities for better mobile UX
      const focusVisibleUtilities = {
        '.focus-visible:focus-visible': {
          outline: '2px solid theme("colors.primary.500")',
          outlineOffset: '2px',
        },
        '.focus-visible-auto': {
          '-webkit-tap-highlight-color': 'transparent',
        },
      };
      addUtilities(focusVisibleUtilities, ['responsive']);

      // Touch-friendly utility for disabled elements
      const touchDisabledUtilities = {
        '.touch-disabled': {
          '-webkit-tap-highlight-color': 'transparent',
        },
      };
      addUtilities(touchDisabledUtilities, ['responsive']);

      // Selection color utilities
      const selectionUtilities = {
        '::-webkit-selection': {
          color: theme('colors.primary.500', '#6366f1'),
          backgroundColor: theme('colors.primary.100', '#eef2ff'),
        },
        '::selection': {
          color: theme('colors.primary.500', '#6366f1'),
          backgroundColor: theme('colors.primary.100', '#eef2ff'),
        },
      };
      addUtilities(selectionUtilities, ['responsive']);
    },
  ],
}
