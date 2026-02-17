/** @type {import('tailwindcss').Config} */
import containerQueries from '@tailwindcss/container-queries'
import colors from 'tailwindcss/colors'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'base-bg': colors.neutral[900],
      }
    },
  },
  plugins: [
    containerQueries,
  ],
}