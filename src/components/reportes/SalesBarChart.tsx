import { Card, CardHeader } from "@/components/ui/Card";
import {
  type BucketReporte,
  type PeriodoReporte,
} from "@/lib/reportes";
import { cn, formatoMoneda } from "@/lib/utils";

interface SalesBarChartProps {
  buckets: BucketReporte[];
  periodo: PeriodoReporte;
  etiqueta: string;
}

const UNIDAD: Record<PeriodoReporte, string> = {
  diario: "por hora",
  semanal: "por día",
  mensual: "por día",
};

function mostrarEtiqueta(
  indice: number,
  total: number,
  periodo: PeriodoReporte
): boolean {
  if (periodo === "diario") return indice % 3 === 0;
  if (periodo === "semanal") return true;
  return total <= 10 || indice % 5 === 0 || indice === total - 1;
}

export function SalesBarChart({
  buckets,
  periodo,
  etiqueta,
}: SalesBarChartProps) {
  const total = buckets.reduce((suma, bucket) => suma + bucket.ingresos, 0);
  const maximo = Math.max(...buckets.map((bucket) => bucket.ingresos), 0);
  const columnas = {
    gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
  };

  return (
    <Card>
      <CardHeader
        title="Evolución de ingresos"
        subtitle={etiqueta}
        action={
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="font-poppins text-base font-bold text-slate-100">
              {formatoMoneda(total)}
            </p>
          </div>
        }
      />

      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Ingresos {UNIDAD[periodo]}</span>
        <span>Máximo: {formatoMoneda(maximo)}</span>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((linea) => (
            <span
              key={linea}
              className="block border-t border-surface-border/50"
            />
          ))}
        </div>

        <div
          className="relative grid h-48 items-end gap-[2px]"
          style={columnas}
        >
          {buckets.map((bucket, indice) => {
            const altura =
              maximo > 0 ? Math.max(4, (bucket.ingresos / maximo) * 100) : 0;

            return (
              <div
                key={`${bucket.label}-${indice}`}
                className="group relative flex h-full flex-col justify-end"
                title={`${bucket.fullLabel}: ${formatoMoneda(
                  bucket.ingresos
                )} · ${bucket.ventas} venta${bucket.ventas === 1 ? "" : "s"}`}
              >
                <div
                  className={cn(
                    "w-full rounded-t transition-colors",
                    bucket.ingresos > 0
                      ? "bg-brand-cyan/70 group-hover:bg-brand-cyan"
                      : "bg-surface-hover"
                  )}
                  style={{ height: bucket.ingresos > 0 ? `${altura}%` : "2px" }}
                />
              </div>
            );
          })}
        </div>

        {total === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-surface-border bg-brand-dark/90 px-3 py-1 text-xs text-slate-400">
              Sin ventas en este periodo
            </span>
          </div>
        )}
      </div>

      <div
        className="mt-2 grid gap-[2px] text-center text-[10px] text-slate-500"
        style={columnas}
      >
        {buckets.map((bucket, indice) => (
          <span
            key={`label-${bucket.label}-${indice}`}
            className={cn(
              "truncate",
              !mostrarEtiqueta(indice, buckets.length, periodo) && "invisible"
            )}
          >
            {bucket.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
