import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).format(valor);
}

export function formatoFecha(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Convierte una duración en milisegundos a texto legible.
 * Ejemplos: 45s, 1h, 1h 30m.
 */
export function formatoDuracion(milisegundos: number): string {
  if (!Number.isFinite(milisegundos) || milisegundos <= 0) return "0s";

  const totalSegundos = Math.floor(milisegundos / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  if (horas > 0) {
    return minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
  }
  if (minutos > 0) {
    return segundos > 0 ? `${minutos}m ${segundos}s` : `${minutos}m`;
  }
  return `${segundos}s`;
}
