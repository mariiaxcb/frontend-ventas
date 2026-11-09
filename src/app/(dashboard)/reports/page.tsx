"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  BarChart3,
  Clock,
  Loader2,
  PackageCheck,
  Percent,
  ReceiptText,
  ShoppingBag,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportKpiCard } from "@/components/reportes/ReportKpiCard";
import { ReportPeriodPicker } from "@/components/reportes/ReportPeriodPicker";
import { SalesBarChart } from "@/components/reportes/SalesBarChart";
import { StatusBreakdown } from "@/components/reportes/StatusBreakdown";
import { TopProductsTable } from "@/components/reportes/TopProductsTable";
import { StreamPerformance } from "@/components/reportes/StreamPerformance";
import { usePedidos } from "@/hooks/usePedidos";
import {
  calcularReporte,
  desplazarReferencia,
  esRangoActual,
  filtrarPedidosPorRango,
  rangoReporte,
  variacionPorcentual,
  type PeriodoReporte,
} from "@/lib/reportes";
import { formatoMoneda, formatoPorcentaje } from "@/lib/utils";

export default function ReportesPage() {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<PeriodoReporte>("diario");
  const [referencia, setReferencia] = useState(() => new Date());

  const { data: pedidos, isLoading, isError, refetch } = usePedidos();

  const rango = useMemo(
    () => rangoReporte(periodo, referencia),
    [periodo, referencia]
  );

  const pedidosPeriodo = useMemo(
    () => filtrarPedidosPorRango(pedidos ?? [], rango),
    [pedidos, rango]
  );
  const pedidosAnteriores = useMemo(
    () => filtrarPedidosPorRango(pedidos ?? [], rango.anterior),
    [pedidos, rango]
  );

  const reporte = useMemo(
    () => calcularReporte(pedidosPeriodo, periodo, rango),
    [pedidosPeriodo, periodo, rango]
  );
  const reporteAnterior = useMemo(
    () => calcularReporte(pedidosAnteriores, periodo, rango.anterior),
    [pedidosAnteriores, periodo, rango]
  );

  const canNext = !esRangoActual(rango);
  const sinPedidos = (pedidos?.length ?? 0) === 0;
  const sinPedidosEnPeriodo = pedidosPeriodo.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes de ventas"
        subtitle="Rendimiento diario, semanal y mensual de tu operación"
      />

      <ReportPeriodPicker
        periodo={periodo}
        etiqueta={rango.etiqueta}
        onChange={setPeriodo}
        onPrev={() =>
          setReferencia((actual) =>
            desplazarReferencia(periodo, actual, -1)
          )
        }
        onNext={() =>
          setReferencia((actual) => desplazarReferencia(periodo, actual, 1))
        }
        canNext={canNext}
      />

      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
          <Loader2 size={26} className="animate-spin text-brand-cyan" />
          <span className="text-sm">Calculando reporte...</span>
        </div>
      )}

      {isError && (
        <EmptyState
          icon={AlertCircle}
          title="No se pudo cargar el reporte"
          description="Verifica que la API esté disponible e inténtalo de nuevo."
          action={{ label: "Reintentar", onClick: () => refetch() }}
        />
      )}

      {!isLoading && !isError && sinPedidos && (
        <EmptyState
          icon={BarChart3}
          title="Todavía no hay ventas registradas"
          description="Cuando inicies una transmisión y se concreten pedidos, aquí verás tus reportes diarios, semanales y mensuales."
          action={{
            label: "Ir a transmisiones",
            onClick: () => router.push("/live"),
          }}
        />
      )}

      {!isLoading && !isError && !sinPedidos && (
        <ReportContent
          reporte={reporte}
          reporteAnterior={reporteAnterior}
          periodo={periodo}
          etiqueta={rango.etiqueta}
          sinPedidosEnPeriodo={sinPedidosEnPeriodo}
        />
      )}
    </div>
  );
}

interface ReportContentProps {
  reporte: ReturnType<typeof calcularReporte>;
  reporteAnterior: ReturnType<typeof calcularReporte>;
  periodo: PeriodoReporte;
  etiqueta: string;
  sinPedidosEnPeriodo: boolean;
}

function ReportContent({
  reporte,
  reporteAnterior,
  periodo,
  etiqueta,
  sinPedidosEnPeriodo,
}: ReportContentProps) {
  const actual = reporte.kpis;
  const previo = reporteAnterior.kpis;

  return (
    <div className="space-y-6">
      {sinPedidosEnPeriodo && (
        <div className="rounded-lg border border-estado-pendiente/30 bg-estado-pendiente/5 px-4 py-3 text-xs text-estado-pendiente">
          No hay pedidos en {etiqueta.toLowerCase()}. Usa las flechas para
          revisar otro periodo.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportKpiCard
          label="Ingresos"
          value={formatoMoneda(actual.ingresos)}
          hint="vs. periodo anterior"
          icon={Banknote}
          tone="success"
          delta={variacionPorcentual(actual.ingresos, previo.ingresos)}
        />
        <ReportKpiCard
          label="Ventas"
          value={String(actual.ventas)}
          hint="pedidos pagados o entregados"
          icon={ShoppingBag}
          tone="brand"
          delta={variacionPorcentual(actual.ventas, previo.ventas)}
        />
        <ReportKpiCard
          label="Ticket promedio"
          value={formatoMoneda(actual.ticketPromedio)}
          hint="por venta"
          icon={ReceiptText}
          tone="info"
          delta={variacionPorcentual(
            actual.ticketPromedio,
            previo.ticketPromedio
          )}
        />
        <ReportKpiCard
          label="Tasa de conversión"
          value={formatoPorcentaje(actual.tasaConversion)}
          hint="ventas / pedidos del periodo"
          icon={Percent}
          tone="warning"
        />
      </div>

      <Card className="grid grid-cols-2 gap-4 p-4 sm:p-5 lg:grid-cols-4">
        <MiniStat
          icon={PackageCheck}
          label="Unidades vendidas"
          value={String(actual.unidades)}
        />
        <MiniStat
          icon={Users}
          label="Clientes únicos"
          value={String(actual.clientes)}
        />
        <MiniStat
          icon={Clock}
          label="Por validar"
          value={`${actual.porCobrar}`}
          hint={formatoMoneda(actual.porCobrarMonto)}
        />
        <MiniStat
          icon={Wallet}
          label="Pendientes de pago"
          value={String(actual.pendientes)}
        />
      </Card>

      <SalesBarChart
        buckets={reporte.buckets}
        periodo={periodo}
        etiqueta={etiqueta}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopProductsTable productos={reporte.productos} />
        <StatusBreakdown
          estados={reporte.estados}
          totalPedidos={actual.pedidos}
        />
      </div>

      <StreamPerformance streams={reporte.streams} />
    </div>
  );
}

interface MiniStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

function MiniStat({ icon: Icon, label, value, hint }: MiniStatProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-lg bg-brand-primary/10 p-2 text-brand-light">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="font-poppins text-sm font-bold text-slate-100">
          {value}
          {hint && (
            <span className="ml-1.5 text-[11px] font-medium text-slate-400">
              {hint}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
