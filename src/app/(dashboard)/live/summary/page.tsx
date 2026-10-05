"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Timer,
  Users,
  ShoppingCart,
  XCircle,
  Banknote,
  Radio,
  Package,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { LiveSummaryMetric } from "@/components/live/LiveSummaryMetric";
import { LiveSummaryStock } from "@/components/live/LiveSummaryStock";
import { LiveSummaryOrders } from "@/components/live/LiveSummaryOrders";
import { useLiveSummary } from "@/hooks/useLiveSummary";
import { formatoDuracion, formatoFecha, formatoMoneda } from "@/lib/utils";

/** Traduce el estado de una orden a texto legible. */
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendientes de pago",
  IN_REVIEW: "Comprobante en revision",
  PAID: "Pagadas",
  REJECTED: "Rechazadas",
  DELIVERED: "Entregadas",
  CANCELLED: "Canceladas",
};

function ResumenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const streamIdParam = searchParams.get("streamId");
  const streamId = streamIdParam ? Number(streamIdParam) : undefined;

  const { data: resumen, isLoading, isError, refetch } = useLiveSummary(streamId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
        <Loader2 size={32} className="animate-spin text-brand-cyan" />
        <p className="text-sm">Calculando el resumen del live...</p>
      </div>
    );
  }

  if (isError || !resumen) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No se pudo cargar el resumen"
        description={
          isError
            ? "Ocurrio un error al consultar las metricas. Verifica que la API este disponible."
            : "No se encontraron datos para esta transmision."
        }
        action={{ label: "Reintentar", onClick: () => refetch() }}
      />
    );
  }

  const pedidosCobrados = resumen.totalSales;
  const Conversion =
    resumen.reservationsTotal > 0
      ? Math.round((pedidosCobrados / resumen.reservationsTotal) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumen de la transmision"
        subtitle={`${resumen.title} - @${resumen.tiktokUsername}`}
        action={
          <Button variant="outline" onClick={() => router.push("/live")}>
            Volver al historial
            <ArrowRight size={16} />
          </Button>
        }
      />

      {/* Identificacion del live */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-primary/10 p-3">
              <Radio size={20} className="text-brand-light" />
            </div>
            <div>
              <p className="font-poppins text-lg font-semibold text-slate-100">
                {resumen.title}
              </p>
              <p className="text-xs text-slate-400">
                @{resumen.tiktokUsername}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <div>
              <span className="block text-slate-500">Inicio</span>
              <span className="font-medium text-slate-200">
                {formatoFecha(resumen.startDate)}
              </span>
            </div>
            <div>
              <span className="block text-slate-500">Fin</span>
              <span className="font-medium text-slate-200">
                {resumen.endDate ? formatoFecha(resumen.endDate) : "En vivo"}
              </span>
            </div>
            <div>
              <span className="block text-slate-500">Estado</span>
              <span
                className={
                  resumen.status === "ENDED"
                    ? "font-medium text-slate-200"
                    : "font-medium text-emerald-400"
                }
              >
                {resumen.status === "ENDED" ? "Finalizado" : "En vivo"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Metricas principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <LiveSummaryMetric
          title="Duracion"
          value={formatoDuracion(resumen.durationMs)}
          icon={Timer}
          tone="brand"
        />
        <LiveSummaryMetric
          title="Personas con reserva"
          value={resumen.reservationsTotal}
          icon={Users}
          tone="brand"
        />
        <LiveSummaryMetric
          title="Ventas"
          value={resumen.totalSales}
          icon={ShoppingCart}
          tone="success"
          hint={`${Conversion}% de conversion`}
        />
        <LiveSummaryMetric
          title="Reservas canceladas"
          value={resumen.cancelledReservations}
          icon={XCircle}
          tone="danger"
          hint="Sin confirmar en 3 min"
        />
        <LiveSummaryMetric
          title="Dinero generado"
          value={formatoMoneda(Number(resumen.totalRevenue))}
          icon={Banknote}
          tone="success"
        />
        <LiveSummaryMetric
          title="Productos ofertados"
          value={resumen.products.length}
          icon={Package}
          tone="warning"
        />
      </div>

      {/* Desglose por estado de orden */}
      {resumen.ordersSummary.length > 0 && (
        <Card>
          <CardHeader
            title="Desglose de ordenes"
            subtitle="Cantidad de ordenes segun su estado"
          />
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {resumen.ordersSummary.map((item) => (
                <div
                  key={item.status}
                  className="rounded-lg border border-brand-primary/10 bg-brand-darkest/40 p-3"
                >
                  <p className="text-xs text-slate-400">
                    {ORDER_STATUS_LABELS[item.status] ?? item.status}
                  </p>
                  <p className="mt-1 font-poppins text-xl font-bold text-slate-100">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalle de cada orden con acceso a su comprobante */}
      <LiveSummaryOrders ordenes={resumen.orders} />

      {/* Stock restante */}
      <LiveSummaryStock productos={resumen.products} />

      <div className="flex justify-end">
        <Link href="/live">
          <Button variant="primary">Ver historial de transmisiones</Button>
        </Link>
      </div>
    </div>
  );
}

export default function LiveSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin text-brand-cyan" />
          <p className="text-sm">Cargando resumen...</p>
        </div>
      }
    >
      <ResumenContent />
    </Suspense>
  );
}