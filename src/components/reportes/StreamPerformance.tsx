import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import type { StreamResumen } from "@/lib/reportes";
import { formatoMoneda } from "@/lib/utils";

interface StreamPerformanceProps {
  streams: StreamResumen[];
}

export function StreamPerformance({ streams }: StreamPerformanceProps) {
  const visibles = streams.slice(0, 5);

  return (
    <Card>
      <CardHeader
        title="Rendimiento por transmisión"
        subtitle="Ventas cobradas durante cada live"
      />

      {visibles.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          Sin ventas asociadas a transmisiones en este periodo.
        </p>
      ) : (
        <ul className="divide-y divide-surface-border/60">
          {visibles.map((stream) => (
            <li key={stream.streamId}>
              <Link
                href={`/live/summary?streamId=${stream.streamId}`}
                className="flex items-center gap-3 py-3 transition-colors hover:text-slate-100"
              >
                <span className="rounded-lg bg-brand-primary/15 p-2 text-brand-light">
                  <Radio size={16} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {stream.titulo}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {stream.ventas} venta{stream.ventas === 1 ? "" : "s"}
                  </p>
                </div>

                <span className="shrink-0 font-poppins text-sm font-bold text-slate-100">
                  {formatoMoneda(stream.ingresos)}
                </span>
                <ArrowUpRight size={15} className="shrink-0 text-slate-500" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
