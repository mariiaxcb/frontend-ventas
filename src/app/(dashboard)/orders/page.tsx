"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Receipt, Eye, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/layout/PageHeader";
import { aplicarFiltros, type OrdenCronologico } from "@/components/ui/DateFilter";
import {
  normalizarTexto,
  rangoPeriodo,
  PERIODOS_FILTRO,
  type PeriodoFiltro,
} from "@/lib/utils";
import { PedidoComprobanteModal } from "@/components/pedidos/PedidoComprobanteModal";
import { usePedidos, useCambiarEstadoPedido } from "@/hooks/usePedidos";
import { formatoFecha, formatoMoneda } from "@/lib/utils";
import type { Pedido, EstadoPedido } from "@/types/pedido";

const FILTROS: { value: EstadoPedido | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "IN_REVIEW", label: "Por validar" },
  { value: "PAID", label: "Pagados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "REJECTED", label: "Rechazados" },
  { value: "CANCELLED", label: "Cancelados" },
];

export default function PedidosPage() {
  const { data: pedidos, isLoading, isError, refetch } = usePedidos();
  const cambiarEstado = useCambiarEstadoPedido();
  const [filtro, setFiltro] = useState<EstadoPedido | "TODOS">("TODOS");
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);
  const [pagina, setPagina] = useState(1);

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("todo");
  const [orden, setOrden] = useState<OrdenCronologico>("recientes");

  const POR_PAGINA = 5;

  /**
   * Estado, búsqueda y fecha se aplican en un solo `useMemo`.
   *
   * Los dos buscadores son independientes a propósito: el vendedor a veces
   * recuerda el producto pero no el cliente, y otras veces al revés. Encadenarlos
   * en un solo campo obligaría a escribir un texto que puede no existir.
   */
  const filtrados = useMemo(() => {
    if (!pedidos) return [];

    const conEstado =
      filtro === "TODOS"
        ? pedidos
        : pedidos.filter((p) => p.status === filtro);

    return aplicarFiltros(conEstado, {
      busqueda: busquedaProducto,
      periodo,
      orden,
      campos: (p) => [
        p.orderItems[0]?.product?.name,
        p.orderItems[0]?.product?.code,
      ],
      fecha: (p) => p.createdAt,
    }).filter((p) => {
      if (!busquedaCliente.trim()) return true;
      const texto = normalizarTexto(busquedaCliente);
      return [p.buyer?.clientName, p.buyer?.tiktokUsername].some((campo) =>
        normalizarTexto(String(campo ?? "")).includes(texto)
      );
    });
  }, [pedidos, filtro, busquedaProducto, busquedaCliente, periodo, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));

  // Si el filtro deja menos paginas, volvemos a la ultima disponible.
  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = useMemo(
    () =>
      filtrados.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA
      ),
    [filtrados, paginaActual]
  );

  /** Cualquier cambio de filtro devuelve al vendedor a la primera pagina. */
  function reiniciarPagina() {
    setPagina(1);
  }

  async function validar(pedido: Pedido) {
    try {
      await cambiarEstado.mutateAsync({ id: pedido.id, status: "PAID" });
      toast.success(`Pago del pedido #${pedido.id} validado`);
      setSeleccionado(null);
    } catch (error) {
      toast.error("No se pudo validar el pago");
    }
  }

  async function rechazar(pedido: Pedido) {
    try {
      await cambiarEstado.mutateAsync({ id: pedido.id, status: "REJECTED" });
      toast.success(`Pago del pedido #${pedido.id} rechazado`);
      setSeleccionado(null);
    } catch (error) {
      toast.error("No se pudo rechazar el pago");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        subtitle="Todos los pedidos del live, del mas reciente al mas antiguo"
      />

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((item) => {
          const total = pedidos
            ? item.value === "TODOS"
              ? pedidos.length
              : pedidos.filter((p) => p.status === item.value).length
            : 0;

          return (
            <button
              key={item.value}
              onClick={() => {
                setFiltro(item.value);
                reiniciarPagina();
              }}
              className={
                filtro === item.value
                  ? "rounded-full bg-brand-primary px-3 py-1.5 text-xs font-semibold text-slate-100"
                  : "rounded-full border border-surface-border bg-brand-dark px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
              }
            >
              {item.label} ({total})
            </button>
          );
        })}
      </div>

      {/* Buscadores por producto y por cliente, más fecha y orden */}
      <div className="rounded-xl border border-surface-border bg-brand-dark p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <label className="relative block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Buscar por producto
            </span>
            <input
              type="text"
              value={busquedaProducto}
              onChange={(e) => {
                setBusquedaProducto(e.target.value);
                reiniciarPagina();
              }}
              placeholder="Nombre o código del producto"
              aria-label="Buscar pedidos por producto"
              className="w-full rounded-md border border-surface-border bg-brand-raised py-2.5 pl-3 pr-3 text-sm text-slate-100 transition-colors placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </label>

          <label className="relative block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Buscar por cliente
            </span>
            <input
              type="text"
              value={busquedaCliente}
              onChange={(e) => {
                setBusquedaCliente(e.target.value);
                reiniciarPagina();
              }}
              placeholder="Nombre o usuario de TikTok"
              aria-label="Buscar pedidos por cliente"
              className="w-full rounded-md border border-surface-border bg-brand-raised py-2.5 pl-3 pr-3 text-sm text-slate-100 transition-colors placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-3 border-t border-surface-border pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filtrar por fecha"
            className="flex flex-wrap items-center gap-1 rounded-md border border-surface-border bg-brand-raised p-1"
          >
            {PERIODOS_FILTRO.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  setPeriodo(p.value);
                  reiniciarPagina();
                }}
                aria-pressed={periodo === p.value}
                className={
                  periodo === p.value
                    ? "rounded bg-brand-cyan px-3 py-1.5 text-xs font-semibold text-brand-darkest"
                    : "rounded px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-100"
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="block flex-1 lg:w-52 lg:flex-none">
              <span className="sr-only">Ordenar por fecha</span>
              <select
                value={orden}
                onChange={(e) => {
                  setOrden(e.target.value as OrdenCronologico);
                  reiniciarPagina();
                }}
                aria-label="Ordenar pedidos por fecha"
                className="w-full appearance-none rounded-md border border-surface-border bg-brand-raised px-3 py-2.5 text-sm text-slate-100 transition-colors focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
              >
                <option value="recientes" className="bg-brand-dark">
                  Más recientes primero
                </option>
                <option value="antiguos" className="bg-brand-dark">
                  Más antiguos primero
                </option>
              </select>
            </label>

            {(busquedaProducto ||
              busquedaCliente ||
              periodo !== "todo" ||
              orden !== "recientes") && (
              <button
                type="button"
                onClick={() => {
                  setBusquedaProducto("");
                  setBusquedaCliente("");
                  setPeriodo("todo");
                  setOrden("recientes");
                  reiniciarPagina();
                }}
                className="shrink-0 text-xs font-semibold text-brand-cyan transition-colors hover:text-emerald-400"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {(busquedaProducto || busquedaCliente || periodo !== "todo") && (
          <p className="mt-3 border-t border-surface-border pt-3 text-xs text-slate-400">
            Mostrando{" "}
            <span className="font-semibold text-slate-200">
              {filtrados.length}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-slate-200">
              {pedidos?.length ?? 0}
            </span>{" "}
            pedidos
            {periodo !== "todo" && (
              <>
                {" "}
                · {rangoPeriodo(periodo).desde.toLocaleDateString("es-BO")} en
                adelante
              </>
            )}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
          <Loader2 size={26} className="animate-spin text-brand-cyan" />
          <span className="text-sm">Cargando pedidos...</span>
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="No se pudieron cargar los pedidos"
          description="Verifica que la API esté disponible."
          action={{ label: "Reintentar", onClick: () => refetch() }}
        />
      ) : visibles.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No hay pedidos"
          description={
            filtro === "TODOS"
              ? "Todavía no se ha realizado ningún pedido."
              : "No hay pedidos con este estado."
          }
        />
      ) : (
        <div className="space-y-3">
          {visibles.map((pedido) => {
            const producto = pedido.orderItems[0]?.product;
            const cantidad = pedido.orderItems[0]?.quantity ?? 0;
            const comprobante = pedido.receipt;
            const pendiente = pedido.status === "IN_REVIEW";

            return (
              <Card
                key={pedido.id}
                className={
                  pendiente
                    ? "border-estado-pendiente/40 bg-brand-dark"
                    : undefined
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Datos del pedido */}
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {producto?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={producto.imageUrl}
                        alt={producto.name}
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-primary/15">
                        <Receipt size={20} className="text-slate-500" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">
                          #{pedido.id}
                        </span>
                        <Badge estado={pedido.status} />
                        {pendiente && (
                          <span className="rounded bg-estado-pendiente/15 px-2 py-0.5 text-[10px] font-semibold text-estado-pendiente">
                            Requiere tu validación
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate font-medium text-slate-100">
                        @{pedido.buyer?.tiktokUsername || "Sin usuario"}
                        <span className="ml-2 text-sm font-normal text-slate-400">
                          {producto?.name} · {cantidad} unidad{cantidad === 1 ? "" : "es"}
                        </span>
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {pedido.stream?.title ?? "Sin live"} ·{" "}
                        {formatoFecha(pedido.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Total y acciones */}
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="font-poppins text-lg font-bold text-brand-cyan">
                        {formatoMoneda(Number(pedido.totalPrice))}
                      </p>
                      {comprobante?.extractedAmount != null && (
                        <p className="text-xs text-slate-400">
                          Detectado:{" "}
                          {formatoMoneda(Number(comprobante.extractedAmount))}
                        </p>
                      )}
                    </div>

                    <Button
                      variant={pendiente ? "primary" : "outline"}
                      onClick={() => setSeleccionado(pedido)}
                    >
                      <Eye size={16} />
                      Comprobante
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filtrados.length > 0 && (
        <Pagination
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          totalElementos={filtrados.length}
          porPagina={POR_PAGINA}
          onCambio={setPagina}
        />
      )}

      <PedidoComprobanteModal
        pedido={seleccionado}
        onClose={() => setSeleccionado(null)}
        onValidar={validar}
        onRechazar={rechazar}
      />
    </div>
  );
}
