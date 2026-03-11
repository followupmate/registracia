/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        magenta: { DEFAULT: "#e20074", dark: "#ff2a91" },
        tblue: { DEFAULT: "#427bab", dark: "#5a9fd4" },
        tgold: { DEFAULT: "#eda95a", dark: "#f0b866" },
      },
      keyframes: {
        cardPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        popIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "card-pulse": "cardPulse 0.25s ease",
        "pop-in": "popIn 0.2s ease",
        "slide-up": "slideUp 0.25s ease",
      },
    },
  },
  plugins: [],
};
