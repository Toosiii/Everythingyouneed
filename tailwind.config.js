/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.html",
    "./**/*.js"
  ],
  darkMode: 'class', // Wichtig, da du eine Darkmode-Klasse nutzt!
  theme: {
    extend: {},
  },
  plugins: [],
}