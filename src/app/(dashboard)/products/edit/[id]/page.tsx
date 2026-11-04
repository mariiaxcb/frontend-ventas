"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { FormHeader } from "@/components/productos/form/FormHeader";
import { ProductForm } from "@/components/productos/form/ProductForm";
import type { ProductFormValues } from "@/components/productos/form/types";
import { useProductoParaEditar } from "@/hooks/useProductoParaEditar";
import { productosApi } from "@/services/productos.api";

export default function EditarProductoPage() {
  const router = useRouter();
  const id = useParams().id as string;
  const { loading, categorias, valores, imagenUrl } = useProductoParaEditar(id);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: ProductFormValues, imagen: File | null) {
    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("code", values.code);
      payload.append("name", values.name);
      payload.append("price", String(values.price));
      payload.append("stock", String(values.stock));
      payload.append("categoryName", values.categoryName);
      if (values.description) payload.append("description", values.description);
      if (imagen) payload.append("image", imagen);

      await productosApi.actualizar(id, payload);

      toast.success("Producto actualizado correctamente");
      router.push("/products");
      router.refresh();
    } catch (error: any) {
      console.error("Error al actualizar el producto:", error);
      toast.error(error.response?.data?.message || "Ocurrió un error al guardar los cambios");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Cargando datos del producto...
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-4">
      <FormHeader title="Editar Producto" subtitle={`Modificando información del producto #${id}`} />

      {valores ? (
        <ProductForm
          initialValues={valores}
          initialImageUrl={imagenUrl}
          codigoOriginal={valores.code}
          categorias={categorias}
          isSubmitting={submitting}
          submitLabel="Guardar Cambios"
          onSubmit={handleSubmit}
        />
      ) : (
        <p className="text-sm text-slate-400">No se pudo cargar el producto.</p>
      )}
    </div>
  );
}