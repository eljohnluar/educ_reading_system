// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#E9D2A9',
        'gold': '#E9D2A9',
        'gold-dark': '#C8A970',
        'dark': '#2B2217',
        'medium': '#5C4E3D',
        'light': '#8C7E6C',
        'easy-green': '#8BC34A',
        'average-orange': '#FFB74D',
        'difficult-purple': '#CE93D8',
        'success': '#27AE60',
        'error': '#E74C3C',
        'warning': '#F39C12',
        'info': '#3498DB',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}