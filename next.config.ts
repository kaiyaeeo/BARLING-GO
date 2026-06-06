import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ["var(--font-jakarta)", "sans-serif"],
      },
      colors: {
        brand: {
          green: "#2D7D46",
          "green-light": "#4CAF50",
          "green-pale": "#e8f0eb",
          orange: "#FF6B35",
          teal: "#3d6b52",
        },
      },
    },
  },
  plugins: [],
}

export default config