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

      // Desactivar/activar es un cambio de estado, no un borrado: el producto
      // se conserva porque las órdenes, reservas e historial lo referencian.
      await productosApi.cambiarEstado(
        selected.id,
        selected.isActive ? "INACTIVE" : "ACTIVE"
      );

      toast.success(
        selected.isActive
          ? "Producto desactivado correctamente"
          : "Producto activado correctamente"
      );

      onSuccess();
      setIsOpen(false);
      setSelected(null);
    } catch (error: any) {
      console.error("Error al cambiar el estado del producto:", error);
      const mensajeBackend =
        error.response?.data?.mensaje ?? error.response?.data?.message;
      toast.error(mensajeBackend || "No se pudo realizar la acción");
    } finally {
      setProcessing(false);
    }
  };

  return { isOpen, selected, processing, abrir, cerrar, confirmar };
}