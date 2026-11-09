import { ConfirmModal } from "@/components/modal/confirmModal";
import type { ProductoSeleccionado } from "@/hooks/useCambioEstadoProducto";

interface ProductStatusModalProps {
  isOpen: boolean;
  producto: ProductoSeleccionado | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ProductStatusModal({
  isOpen,
  producto,
  isLoading,
  onClose,
  onConfirm,
}: ProductStatusModalProps) {
  const desactivando = producto?.isActive;

  const nombre = (
    <span className="font-semibold text-slate-100">"{producto?.name}"</span>
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={desactivando ? "Confirmar Desactivación" : "Confirmar Activación"}
      description={
        desactivando ? (
          <>
            ¿Estás seguro de que deseas desactivar el producto {nombre}? El producto
            dejará de estar disponible en el catálogo público.
          </>
        ) : (
          <>
            ¿Deseas activar nuevamente el producto {nombre}? Volverá a estar
            disponible en el sistema.
          </>
        )
      }
      confirmText={desactivando ? "Sí, Desactivar" : "Sí, Activar"}
      cancelText="No, Cancelar"
      isLoading={isLoading}
      variant={desactivando ? "danger" : undefined}
    />
  );
}