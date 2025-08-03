/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        azul: "#002244",
        prata: "#D9D9D9",
        amarelo: "#FFD700",
        grafite: "#111111",
      },
    },
  },
  plugins: [],
}
