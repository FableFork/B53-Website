import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted:      "#888880",
        brand:      "#fa3d00",
        hairline:   "rgba(255,255,255,0.12)",
      },
      fontFamily: {
        niagara: ["var(--font-niagara)", "serif"],
        geist:   ["var(--font-geist)", "sans-serif"],
        mono:    ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
