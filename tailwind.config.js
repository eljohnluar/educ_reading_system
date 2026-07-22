/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#E5DCCD',
        'gold': '#E9D2A9',
        'dark': '#2C3E50',
        'medium': '#5D4E37',
        'light': '#7F8C8D',
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