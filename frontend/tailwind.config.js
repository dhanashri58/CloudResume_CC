/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#060913',
          900: '#0a0f1d',
          850: '#0e1529',
          800: '#131b34',
          700: '#1e294b',
        },
        azure: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9e0fe',
          300: '#7cc5fd',
          400: '#36a6fa',
          500: '#0c87eb',
          600: '#006ac9',
          700: '#0054a3',
          800: '#044786',
          900: '#0a3c6f',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'glow-sm': '0 0 20px -5px rgba(59, 130, 246, 0.25)',
        'glow-md': '0 0 35px -5px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 50px -10px rgba(99, 102, 241, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
