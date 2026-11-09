import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import type { EstadoPedido, Pedido } from "@/types/pedido";

export type PeriodoReporte = "diario" | "semanal" | "mensual";

export const PERIODOS_REPORTE: { value: PeriodoReporte; label: string }[] = [
  { value: "diario", label: "Diario" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
];

/** Estados que cuentan como venta cobrada. */
export const ESTADOS_VENTA: EstadoPedido[] = ["PAID", "DELIVERED"];

const ORDEN_ESTADOS: EstadoPedido[] = [
  "PENDING",
  "IN_REVIEW",
  "PAID",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
];

export interface RangoReporte {
  /** Inclusivo. */
  desde: Date;
  /** Exclusivo. */
  hasta: Date;
}

export interface RangoReporteEtiquetado extends RangoReporte {
  etiqueta: string;
  /** Mismo periodo inmediatamente anterior, para comparar. */
  anterior: RangoReporte;
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Rango del periodo que se está reportando.
 *
 * `hasta` es exclusivo para que los cortes no se solapen: una orden creada
 * exactamente a las 00:00 del día siguiente pertenece al día siguiente.
 * La semana empieza el lunes, igual que en el resto del panel.
 */
export function rangoReporte(
  periodo: PeriodoReporte,
  referencia: Date = new Date()
): RangoReporteEtiquetado {
  switch (periodo) {
    case "diario": {
      const desde = startOfDay(referencia);
      return {
        desde,
        hasta: addDays(desde, 1),
        etiqueta: capitalizar(
          format(desde, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
        ),
        anterior: { desde: subDays(desde, 1), hasta: desde },
      };
    }

    case "semanal": {
      const desde = startOfWeek(referencia, { weekStartsOn: 1 });
      const hasta = addDays(desde, 7);
      const fin = subDays(hasta, 1);
      const mismoMes = desde.getMonth() === fin.getMonth();
      const etiqueta = mismoMes
        ? `Semana del ${format(desde, "d", { locale: es })} al ${format(
            fin,
            "d 'de' MMMM 'de' yyyy",
            { locale: es }
          )}`
        : `Semana del ${format(desde, "d 'de' MMMM", {
            locale: es,
          })} al ${format(fin, "d 'de' MMMM 'de' yyyy", { locale: es })}`;

      return {
        desde,
        hasta,
        etiqueta: capitalizar(etiqueta),
        anterior: { desde: subWeeks(desde, 1), hasta: desde },
      };
    }

    case "mensual": {
      const desde = startOfMonth(referencia);
      return {
        desde,
        hasta: addMonths(desde, 1),
        etiqueta: capitalizar(
          format(desde, "MMMM 'de' yyyy", { locale: es })
        ),
        anterior: { desde: subMonths(desde, 1), hasta: desde },
      };
    }
  }
}

/** Mueve la fecha de referencia uno o más periodos hacia atrás o adelante. */
export function desplazarReferencia(
  periodo: PeriodoReporte,
  referencia: Date,
  pasos: number
): Date {
  switch (periodo) {
    case "diario":
      return addDays(referencia, pasos);
    case "semanal":
      return addWeeks(referencia, pasos);
    case "mensual":
      return addMonths(referencia, pasos);
  }
}

/** Indica si el rango incluye el momento actual (no se puede avanzar más). */
export function esRangoActual(
  rango: RangoReporte,
  ahora: Date = new Date()
): boolean {
  return ahora >= rango.desde && ahora < rango.hasta;
}

export function filtrarPedidosPorRango(
  pedidos: Pedido[],
  rango: RangoReporte
): Pedido[] {
  return pedidos.filter((pedido) => {
    const fecha = new Date(pedido.createdAt);
    return fecha >= rango.desde && fecha < rango.hasta;
  });
}

export interface KpisReporte {
  ingresos: number;
  ventas: number;
  unidades: number;
  ticketPromedio: number;
  clientes: number;
  pedidos: number;
  tasaConversion: number;
  porCobrar: number;
  porCobrarMonto: number;
  pendientes: number;
}

export interface BucketReporte {
  /** Etiqueta corta para el eje. */
  label: string;
  /** Etiqueta completa para el tooltip. */
  fullLabel: string;
  ingresos: number;
  ventas: number;
}

export interface ProductoVendido {
  id: number;
  name: string;
  code: string;
  unidades: number;
  ingresos: number;
}

export interface EstadoResumen {
  estado: EstadoPedido;
  cantidad: number;
  monto: number;
}

export interface StreamResumen {
  streamId: number;
  titulo: string;
  ventas: number;
  ingresos: number;
}

export interface ReporteData {
  kpis: KpisReporte;
  buckets: BucketReporte[];
  productos: ProductoVendido[];
  estados: EstadoResumen[];
  streams: StreamResumen[];
}

/** Crea los buckets vacíos del gráfico según el periodo. */
function crearBuckets(
  periodo: PeriodoReporte,
  rango: RangoReporte
): BucketReporte[] {
  if (periodo === "diario") {
    return Array.from({ length: 24 }, (_, hora) => {
      const hh = String(hora).padStart(2, "0");
      return {
        label: `${hh}h`,
        fullLabel: `${hh}:00 – ${hh}:59`,
        ingresos: 0,
        ventas: 0,
      };
    });
  }

  if (periodo === "semanal") {
    return Array.from({ length: 7 }, (_, indice) => {
      const dia = addDays(rango.desde, indice);
      return {
        label: capitalizar(format(dia, "EEE d", { locale: es })),
        fullLabel: capitalizar(
          format(dia, "EEEE d 'de' MMMM", { locale: es })
        ),
        ingresos: 0,
        ventas: 0,
      };
    });
  }

  const dias = differenceInCalendarDays(rango.hasta, rango.desde);
  return Array.from({ length: dias }, (_, indice) => {
    const dia = addDays(rango.desde, indice);
    return {
      label: format(dia, "d"),
      fullLabel: capitalizar(
        format(dia, "EEEE d 'de' MMMM", { locale: es })
      ),
      ingresos: 0,
      ventas: 0,
    };
  });
}

/**
 * Agrega los pedidos del periodo en las métricas que muestra el reporte.
 * Es una función pura: recibe pedidos ya filtrados por rango.
 */
export function calcularReporte(
  pedidos: Pedido[],
  periodo: PeriodoReporte,
  rango: RangoReporte
): ReporteData {
  const ventas = pedidos.filter((p) => ESTADOS_VENTA.includes(p.status));
  const enRevision = pedidos.filter((p) => p.status === "IN_REVIEW");
  const pendientes = pedidos.filter((p) => p.status === "PENDING");

  const ingresos = ventas.reduce((total, p) => total + Number(p.totalPrice), 0);
  const unidades = ventas.reduce(
    (total, p) =>
      total + p.orderItems.reduce((suma, item) => suma + item.quantity, 0),
    0
  );

  const kpis: KpisReporte = {
    ingresos,
    ventas: ventas.length,
    unidades,
    ticketPromedio: ventas.length > 0 ? ingresos / ventas.length : 0,
    clientes: new Set(ventas.map((p) => p.buyerId)).size,
    pedidos: pedidos.length,
    tasaConversion:
      pedidos.length > 0 ? (ventas.length / pedidos.length) * 100 : 0,
    porCobrar: enRevision.length,
    porCobrarMonto: enRevision.reduce(
      (total, p) => total + Number(p.totalPrice),
      0
    ),
    pendientes: pendientes.length,
  };

  const buckets = crearBuckets(periodo, rango);
  for (const pedido of ventas) {
    const fecha = new Date(pedido.createdAt);
    const indice =
      periodo === "diario"
        ? fecha.getHours()
        : differenceInCalendarDays(startOfDay(fecha), rango.desde);

    const bucket = buckets[indice];
    if (!bucket) continue;

    bucket.ingresos += Number(pedido.totalPrice);
    bucket.ventas += 1;
  }

  const productosPorId = new Map<number, ProductoVendido>();
  for (const pedido of ventas) {
    for (const item of pedido.orderItems) {
      const actual = productosPorId.get(item.productId) ?? {
        id: item.productId,
        name: item.product?.name ?? "Producto",
        code: item.product?.code ?? "",
        unidades: 0,
        ingresos: 0,
      };

      actual.unidades += item.quantity;
      actual.ingresos += item.quantity * Number(item.unitPrice);
      productosPorId.set(item.productId, actual);
    }
  }

  const productos = [...productosPorId.values()].sort(
    (a, b) => b.ingresos - a.ingresos || b.unidades - a.unidades
  );

  const estados = ORDEN_ESTADOS.map((estado) => {
    const delEstado = pedidos.filter((p) => p.status === estado);
    return {
      estado,
      cantidad: delEstado.length,
      monto: delEstado.reduce((total, p) => total + Number(p.totalPrice), 0),
    };
  }).filter((fila) => fila.cantidad > 0);

  const streamsPorId = new Map<number, StreamResumen>();
  for (const pedido of ventas) {
    const actual = streamsPorId.get(pedido.streamId) ?? {
      streamId: pedido.streamId,
      titulo: pedido.stream?.title ?? `Transmisión #${pedido.streamId}`,
      ventas: 0,
      ingresos: 0,
    };

    actual.ventas += 1;
    actual.ingresos += Number(pedido.totalPrice);
    streamsPorId.set(pedido.streamId, actual);
  }

  const streams = [...streamsPorId.values()].sort(
    (a, b) => b.ingresos - a.ingresos
  );

  return { kpis, buckets, productos, estados, streams };
}

/**
 * Variación porcentual entre dos valores. Devuelve `null` cuando no hay base
 * de comparación (periodo anterior en cero y actual con datos), para no
 * mostrar un "+∞%" que no significa nada.
 */
export function variacionPorcentual(
  actual: number,
  anterior: number
): number | null {
  if (anterior === 0) return actual === 0 ? 0 : null;
  return ((actual - anterior) / anterior) * 100;
}
