/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        azul: "#002244",
        prata: "#D9D9D9",
        amarelo: "#FFD700",
        grafite: "#111111",
      },
      borderRadius: { xl: "var(--radius)" },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,.22)",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-animate')
  ],
};
