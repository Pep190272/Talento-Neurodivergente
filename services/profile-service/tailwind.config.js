/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/templates/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Orbitron", "monospace"],
        body: ["Rajdhani", "sans-serif"],
      },
      colors: {
        primary: { DEFAULT: "#046BD2", deep: "#045CB4", dark: "#034A9A" },
        dark: "#1E293B",
      },
    },
  },
  plugins: [],
};
