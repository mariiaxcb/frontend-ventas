"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Radio, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useStreams } from "@/hooks/useStreams";
import { formatoFecha } from "@/lib/utils";
import type { Stream } from "@/services/streams.api";

const POR_PAGINA = 10;

export default function ReportesPage() {
  const router = useRouter();
  const { data: streams, isLoading, isError, refetch } = useStreams();
  const [pagina, setPagina] = useState(1);

  // El backend devuelve las transmisiones de la mas reciente a la mas antigua.
  const lista = useMemo(() => streams ?? [], [streams]);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = useMemo(
    () =>
      lista.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
      ),
    [lista, paginaActual]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
        <Loader2 size={26} className="animate-spin text-brand-cyan" />
        <span className="text-sm">Cargando transmisiones...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No se pudieron cargar los reportes"
        description="Verifica que la API esté disponible."
        action={{ label: "Reintentar", onClick: () => refetch() }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        subtitle="Historial de transmisiones y sus resultados"
      />

      {lista.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Todavía no hay transmisiones"
          description="Cuando inicies tu primer live aparecerá aquí con su resumen."
        />
      ) : (
        <>
          <div className="space-y-3">
            {visibles.map((stream) => (
              <ReportRow
                key={stream.id}
                stream={stream}
                onClick={() =>
                  router.push(`/live/summary?streamId=${stream.id}`)
                }
              />
            ))}
          </div>

          <Pagination
            pagina={paginaActual}
            totalPaginas={totalPaginas}
            totalElementos={lista.length}
            porPagina={POR_PAGINA}
            onCambio={setPagina}
          />
        </>
      )}
    </div>
  );
}

interface ReportRowProps {
  stream: Stream;
  onClick: () => void;
}

function ReportRow({ stream, onClick }: ReportRowProps) {
  const enVivo = stream.status === "LIVE";

  return (
    <Card className="cursor-pointer transition-colors hover:border-brand-cyan/40">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
            <Radio
              size={22}
              className={enVivo ? "text-emerald-400" : "text-brand-light"}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-medium text-slate-100">{stream.title}</span>
              {enVivo ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  EN VIVO
                </span>
              ) : (
                <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Finalizado
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-slate-400">
              @{stream.tiktokUsername} · Inicio {formatoFecha(stream.startDate)}
              {stream.endDate ? ` · Fin ${formatoFecha(stream.endDate)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-400">Pedidos</p>
            <p className="font-poppins text-base font-bold text-slate-100">
              {(stream as any)._count?.orders ?? 0}
            </p>
          </div>
          <div className="hidden text-right md:block">
            <p className="text-xs text-slate-400">Productos</p>
            <p className="font-poppins text-base font-bold text-slate-100">
              {stream.products?.length ?? 0}
            </p>
          </div>
          <ChevronRight size={18} className="text-slate-500" />
        </div>
      </button>
    </Card>
  );
}