"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  useProductos,
  useCrearProducto,
  useEliminarProducto,
} from "@/hooks/useProductos";
import { formatoMoneda } from "@/lib/utils";
import type { ProductoInput } from "@/types/producto";

export default function ProductosPage() {
  const { data: productos, isLoading } = useProductos();
  const crearProducto = useCrearProducto();
  const eliminarProducto = useEliminarProducto();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevo, setNuevo] = useState<ProductoInput>({
    nombre: "",
    precio: 0,
    stock: 0,
  });

  async function handleCrear() {
    await crearProducto.mutateAsync(nuevo);
    setModalAbierto(false);
    setNuevo({ nombre: "", precio: 0, stock: 0 });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos en oferta</h1>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus size={16} className="mr-2" /> Nuevo producto
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Nombre</TableHeadCell>
            <TableHeadCell>Precio</TableHeadCell>
            <TableHeadCell>Stock</TableHeadCell>
            <TableHeadCell>Estado</TableHeadCell>
            <TableHeadCell>Acciones</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell className="text-gray-400">Cargando…</TableCell>
            </TableRow>
          )}
          {(productos ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.nombre}</TableCell>
              <TableCell>{formatoMoneda(p.precio)}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>{p.activo ? "Activo" : "Inactivo"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-primary">
                    <Pencil size={16} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-estado-rechazado"
                    onClick={() => eliminarProducto.mutate(p.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo="Nuevo producto"
      >
        <div className="space-y-3">
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Nombre"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
          <input
            type="number"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Precio"
            value={nuevo.precio}
            onChange={(e) => setNuevo({ ...nuevo, precio: Number(e.target.value) })}
          />
          <input
            type="number"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Stock"
            value={nuevo.stock}
            onChange={(e) => setNuevo({ ...nuevo, stock: Number(e.target.value) })}
          />
          <Button className="w-full" onClick={handleCrear}>
            Guardar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
