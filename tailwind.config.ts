import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          600: "#047857",
          700: "#065f46",
          800: "#064e3b",
          900: "#022c22",
        },
      },
      fontSize: {
        base: ["1.0625rem", { lineHeight: "1.6" }],
      },
    },
  },
  plugins: [],
};

export default config;
