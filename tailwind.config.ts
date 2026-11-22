import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivy: {
          50: "#f0f5ee",
          100: "#dce9d8",
          300: "#9bb991",
          500: "#557d4c",
          700: "#345333",
          950: "#10180f",
        },
        cream: "#f7f5ef",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
