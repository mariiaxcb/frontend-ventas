import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        brand: {
          darkest: "#001449",
          dark: "#012677",
          primary: "#005BC5",
          light: "#00B4FC",
          cyan: "#17F9FF",
        },
        primary: {
          DEFAULT: "#005BC5",
          dark: "#012677",
          light: "#00B4FC",
        },
        secondary: {
          DEFAULT: "#17F9FF",
          light: "#00B4FC",
        },
        estado: {
          pendiente: "#f59e0b",
          validado: "#22c55e",
          rechazado: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};

export default config;
