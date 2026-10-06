"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { useCrearProducto, useActualizarProducto, useCategorias } from "@/hooks/useProductos";
import { useValidarCodigo } from "@/hooks/useProductos";
import type { Producto, ProductoInput } from "@/types/producto";
import type { CrearProductoPayload } from "@/services/productos.api";

const productSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.number().positive("El precio debe ser positivo"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  categoryName: z.string().min(1, "La categoría es requerida"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  producto?: Producto;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ producto, onSuccess, onCancel }: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { data: categorias } = useCategorias();
  const crearProducto = useCrearProducto();
  const actualizarProducto = useActualizarProducto();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: producto
      ? {
          code: producto.code,
          name: producto.name,
          description: producto.description || "",
          price: Number(producto.price),
          stock: producto.stock,
          categoryName: producto.category?.nombre || "",
        }
      : {
          code: "",
          name: "",
          description: "",
          price: 0,
          stock: 0,
          categoryName: "",
        },
  });

  const codigo = watch("code");
  const { data: codigoData } = useValidarCodigo(codigo);
  const codigoExiste = codigoData?.exists ?? false;

  async function onSubmit(values: ProductFormValues) {
    try {
      const payload: CrearProductoPayload = {
        code: values.code,
        name: values.name,
        price: values.price,
        stock: values.stock,
        categoryName: values.categoryName,
        description: values.description,
        image: imageFile,
      };

      if (producto) {
        await actualizarProducto.mutateAsync({ id: producto.id.toString(), input: payload });
      } else {
        await crearProducto.mutateAsync(payload);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  }

  return (
    <Card>
      <CardHeader
        title={producto ? "Editar Producto" : "Nuevo Producto"}
        subtitle={producto ? `Editando: ${producto.name}` : "Completa los datos del producto"}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                placeholder="Ej: PROD-001"
                error={errors.code?.message}
                {...register("code")}
              />
              <Input
                placeholder="Nombre del producto"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Precio (Bs.)"
                error={errors.price?.message}
                {...register("price", { valueAsNumber: true })}
              />
              <Input
                type="number"
                placeholder="Stock"
                error={errors.stock?.message}
                {...register("stock", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Categoría
              </label>
              <select
                {...register("categoryName")}
                className="w-full rounded-md border border-surface-border bg-brand-darkest px-3 py-2.5 text-sm text-slate-100 focus:border-brand-cyan focus:outline-none"
              >
                <option value="">Seleccionar categoría</option>
                {categorias?.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoryName && (
                <p className="mt-1 text-xs text-estado-rechazado">{errors.categoryName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Descripción
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Descripción del producto..."
                className="w-full rounded-md border border-surface-border bg-brand-darkest px-3 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:border-brand-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Imagen
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-100 hover:file:bg-brand-light"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || codigoExiste}>
            {isSubmitting
              ? "Guardando..."
              : producto
                ? "Actualizar Producto"
                : "Crear Producto"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
