"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FormHeader } from "@/components/productos/form/FormHeader";
import { ProductForm } from "@/components/productos/form/ProductForm";
import type { ProductFormValues } from "@/components/productos/form/types";
import { useCrearProducto, useCategorias } from "@/hooks/useProductos";

export default function NuevoProductoPage() {
  const router = useRouter();
  const crearProducto = useCrearProducto();
  const { data: categorias, isLoading } = useCategorias();

  async function handleSubmit(values: ProductFormValues, imagen: File | null) {
    try {
      await crearProducto.mutateAsync({
        code: values.code,
        name: values.name,
        price: Number(values.price),
        stock: Number(values.stock),
        categoryName: values.categoryName,
        description: values.description,
        image: imagen,
      });
      toast.success("Producto creado con éxito");
      router.push("/products");
      router.refresh();
    } catch (error: any) {
      console.error("Error al crear producto:", error);
      toast.error(error.response?.data?.message || "Ocurrió un error al crear el producto");
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4">
  <FormHeader title="Agregar Nuevo Producto" />
  <ProductForm
    categorias={categorias ?? []}
    cargandoCategorias={isLoading}
    permitirNuevaCategoria
    isSubmitting={crearProducto.isPending}
    onSubmit={handleSubmit}
  />
</div>
  );
}