import { Edit, Trash2, Power } from "lucide-react";
import { IconAction } from "./IconAction";
import { estaActivo, formatoBs } from "@/lib/productos";

interface ProductTableProps {
  productos: any[];
  onCambiarEstado: (producto: any, isActive: boolean) => void;
}

function EstadoBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-estado-validado/30 bg-estado-validado/10 px-2 py-0.5 text-[10px] font-medium text-estado-validado">
      <span className="h-1.5 w-1.5 rounded-full bg-estado-validado" />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
      Inactivo
    </span>
  );
}

function Acciones({
  producto,
  isActive,
  onCambiarEstado,
}: {
  producto: any;
  isActive: boolean;
  onCambiarEstado: (producto: any, isActive: boolean) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <IconAction
        label="Editar"
        icon={Edit}
        href={`/products/edit/${producto.id}`}
        tooltip={false}
      />
      {isActive ? (
        <IconAction
          label="Desactivar"
          icon={Trash2}
          variant="danger"
          tooltip={false}
          onClick={() => onCambiarEstado(producto, true)}
        />
      ) : (
        <IconAction
          label="Reactivar"
          icon={Power}
          variant="success"
          tooltip={false}
          onClick={() => onCambiarEstado(producto, false)}
        />
      )}
    </div>
  );
}

export function ProductTable({ productos, onCambiarEstado }: ProductTableProps) {
  return (
    <>
      {/* MÓVIL: lista compacta */}
      <ul className="divide-y divide-surface-border/60 overflow-hidden rounded-xl border border-surface-border bg-brand-dark md:hidden">
        {productos.map((producto) => {
          const isActive = estaActivo(producto);

          return (
            <li
              key={producto.id}
              className={`flex items-center justify-between gap-3 p-3 ${
                !isActive ? "bg-brand-darkest/40 opacity-60" : ""
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold text-slate-100">
                  {producto.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                  <span className="font-bold text-brand-cyan">
                    {formatoBs(producto.price)}
                  </span>
                  <span>·</span>
                  <span>Stock: {producto.stock}</span>
                  {producto.code && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{producto.code}</span>
                    </>
                  )}
                </div>
                <EstadoBadge isActive={isActive} />
              </div>

              <Acciones
                producto={producto}
                isActive={isActive}
                onCambiarEstado={onCambiarEstado}
              />
            </li>
          );
        })}
      </ul>

      {/* TABLET / ESCRITORIO: tabla */}
      <div className="hidden overflow-hidden rounded-xl border border-surface-border bg-brand-dark md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-surface-border bg-brand-darkest/60 uppercase tracking-wider text-slate-400">
              <tr>
                <th className="hidden p-3 font-semibold lg:table-cell lg:p-4">Código</th>
                <th className="p-3 font-semibold lg:p-4">Producto</th>
                <th className="hidden p-3 font-semibold lg:table-cell lg:p-4">Categoría</th>
                <th className="p-3 font-semibold lg:p-4">Precio</th>
                <th className="p-3 font-semibold lg:p-4">Stock</th>
                <th className="p-3 font-semibold lg:p-4">Estado</th>
                <th className="p-3 text-right font-semibold lg:p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {productos.map((producto) => {
                const isActive = estaActivo(producto);

                return (
                  <tr
                    key={producto.id}
                    className={`transition-colors hover:bg-surface-hover ${
                      !isActive ? "bg-brand-darkest/40 opacity-60" : ""
                    }`}
                  >
                    <td className="hidden p-3 lg:table-cell lg:p-4">
                      <span className="rounded border border-surface-border bg-brand-darkest px-2 py-1 font-mono text-[11px] text-slate-300">
                        {producto.code || "S/C"}
                      </span>
                    </td>
                    <td className="max-w-[14rem] p-3 lg:p-4">
                      <div className="truncate font-semibold text-slate-100">
                        {producto.name}
                      </div>
                    </td>
                    <td className="hidden p-3 lg:table-cell lg:p-4">
                      {producto.category?.name ? (
                        <span className="rounded border border-surface-border bg-brand-darkest px-2 py-0.5 text-[10px] font-semibold text-brand-cyan">
                          {producto.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-3 font-bold text-brand-cyan lg:p-4">
                      {formatoBs(producto.price)}
                    </td>
                    <td className="whitespace-nowrap p-3 text-slate-300 lg:p-4">
                      {producto.stock}
                      <span className="hidden xl:inline"> unidades</span>
                    </td>
                    <td className="p-3 lg:p-4">
                      <EstadoBadge isActive={isActive} />
                    </td>
                    <td className="p-3 lg:p-4">
                      <Acciones
                        producto={producto}
                        isActive={isActive}
                        onCambiarEstado={onCambiarEstado}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}