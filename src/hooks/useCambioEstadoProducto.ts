"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { productosApi } from "@/services/productos.api";

export interface ProductoSeleccionado {
  id: number | string;
  name: string;
  isActive: boolean;
}

export function useCambioEstadoProducto(onSuccess: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<ProductoSeleccionado | null>(null);
  const [processing, setProcessing] = useState(false);

  const abrir = (id: number | string, name: string, isActive: boolean) => {
    setSelected({ id, name, isActive });
    setIsOpen(true);
  };

  const cerrar = () => {
    if (processing) return;
    setIsOpen(false);
    setSelected(null);
  };

  const confirmar = async () => {
    if (!selected) return;

    try {
      setProcessing(true);

      if (selected.isActive) {
        await productosApi.eliminar(selected.id);
        toast.success("Producto desactivado correctamente");
      } else {
        const api = productosApi as any;
        if (typeof api.reactivar === "function") {
          await api.reactivar(selected.id);
        } else if (typeof api.actualizar === "function") {
          await api.actualizar(selected.id, { isActive: true });
        }
        toast.success("Producto activado correctamente");
      }

      onSuccess();
      setProcessing(false);
      setIsOpen(false);
      setSelected(null);
    } catch (error: any) {
      console.error("Error al cambiar el estado del producto:", error);
      toast.error(error.response?.data?.message || "No se pudo realizar la acción");
      setProcessing(false);
    }
  };

  return { isOpen, selected, processing, abrir, cerrar, confirmar };
}