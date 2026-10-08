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
 * Normaliza texto para búsquedas: sin acentos y en minúsculas.
 *
 * Sin esto, buscar "camisa" no encuentra "Camisa" y buscar "pantalon" no
 * encuentra "Pantalón", que es justo lo que un vendedor escribe.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/**
 * Devuelve el rango [desde, hasta] de un periodo relativo, en milisegundos.
 *
 * Los cortes se calculan en hora local, no en UTC: si "hoy" empezara a las
 * 00:00 UTC, en Bolivia (UTC-4) la tarde siguiente ya estaría
 * dentro de "hoy", que es intuitivamente incorrecto para el vendedor.
 */
export function rangoPeriodo(
  periodo: PeriodoFiltro,
  ahora: Date = new Date()
): { desde: Date; hasta: Date } {
  const inicioDia = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  );

  switch (periodo) {
    case "hoy":
      return { desde: inicioDia, hasta: new Date(ahora.getTime()) };

    case "semana": {
      // Semana que empieza el lunes, que es como la cuenta el vendedor.
      const diaSemana = (inicioDia.getDay() + 6) % 7;
      const lunes = new Date(inicioDia);
      lunes.setDate(lunes.getDate() - diaSemana);
      return { desde: lunes, hasta: new Date(ahora.getTime()) };
    }

    case "mes":
      return {
        desde: new Date(ahora.getFullYear(), ahora.getMonth(), 1),
        hasta: new Date(ahora.getTime()),
      };

    case "mes-anterior": {
      const primeroEsteMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoMesAnterior = new Date(primeroEsteMes);
      ultimoMesAnterior.setMonth(ultimoMesAnterior.getMonth() - 1);
      return { desde: ultimoMesAnterior, hasta: primeroEsteMes };
    }

    case "todo":
    default:
      return { desde: new Date(0), hasta: new Date(ahora.getTime()) };
  }
}

/** Filtros de fecha que comparten Reportes y Pedidos. */
export const PERIODOS_FILTRO = [
  { value: "todo", label: "Todo" },
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
  { value: "mes-anterior", label: "Mes anterior" },
] as const;

export type PeriodoFiltro = (typeof PERIODOS_FILTRO)[number]["value"];

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
