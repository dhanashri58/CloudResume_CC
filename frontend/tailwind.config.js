/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      }
    },
  },
  plugins: [],
}

