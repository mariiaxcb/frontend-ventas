import type { Config } from "tailwindcss";

/**
 * Paleta de la aplicacion.
 *
 * El nucleo es un azul profundo (confianza, 덜 money) con un acento verde
 * esmeralda, porque la app spends casi todo su tiempo en dos momentos: confirmar
 * que entro dinero y avisar que algo quedo pendiente. Por eso el verde se
 * reserva para lo validado y el ambar para lo que espera accion.
 *
 * Tema oscuro: la app se usa en vivo, junto al stream, y fondo claro cansa
 * mas la vista en una sesion larga.
 */
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
        // Superficies, de mas profunda a mas elevada.
        brand: {
          darkest: "#060D1F",
          dark: "#0C1629",
          raised: "#111F38",
          primary: "#1E5EFF",
          light: "#5B8DEF",
          cyan: "#34D399",
        },
        // Nombres viejos, mantenidos por compatibilidad con clases existentes.
        primary: {
          DEFAULT: "#1E5EFF",
          dark: "#0C1629",
          light: "#5B8DEF",
        },
        secondary: {
          DEFAULT: "#34D399",
          light: "#5B8DEF",
        },
        // Semantica de venta.
        estado: {
          pendiente: "#F59E0B",
          validado: "#34D399",
          rechazado: "#EF4444",
          vendido: "#1E5EFF",
          highlight: "#A78BFA",
        },
        // Superficie de las notificaciones y estados de carga.
        surface: {
          DEFAULT: "#0C1629",
          hover: "#16233C",
          border: "#1F3050",
        },
      },
    },
  },
  plugins: [],
};

export default config;