import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FE2C55",
          dark: "#c8203f",
        },
        secondary: {
          DEFAULT: "#25F4EE",
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
