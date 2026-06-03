import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Official Hyperliquid brand palette
        "hl-aqua": "#97FCE4",
        "hl-firefly": "#0F3933",
        "hl-ebony": "#04060C",
        "hl-foam": "#f5fefd",
      },
      fontFamily: {
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
