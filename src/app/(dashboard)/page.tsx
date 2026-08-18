"use client";

import { usePedidos } from "@/hooks/usePedidos";
import { useProductos } from "@/hooks/useProductos";
import { formatoMoneda } from "@/lib/utils";

export default function DashboardPage() {
  const { data: pedidos } = usePedidos();
  const { data: productos } = useProductos();

  const totalVentas = (pedidos ?? [])
    .filter((p) => p.estado === "VALIDADO")
    .reduce((acc, p) => acc + p.total, 0);

  const pendientes = (pedidos ?? []).filter((p) => p.estado === "PENDIENTE").length;

  const tarjetas = [
    { label: "Ventas validadas", valor: formatoMoneda(totalVentas) },
    { label: "Pedidos pendientes", valor: pendientes },
    { label: "Productos activos", valor: (productos ?? []).filter((p) => p.activo).length },
    { label: "Total pedidos", valor: (pedidos ?? []).length },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
        Métricas de la transmisión en vivo
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-brand-primary/20 bg-brand-dark p-5 shadow-md hover:border-brand-light/40 transition-all duration-300 hover:shadow-brand-light/5"
          >
            <p className="text-xs font-poppins font-medium uppercase tracking-wider text-slate-400">
              {t.label}
            </p>
            <p className="mt-2 text-2xl font-inter font-bold tracking-tight text-white">
              {t.valor}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
