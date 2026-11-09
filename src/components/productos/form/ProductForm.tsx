"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEstadoCodigo } from "@/hooks/useEstadoCodigo";
import { FormField, FIELD_CLASS } from "./FormField";
import { CodigoField } from "./CodigoField";
import { CategoriaField } from "./CategoriaField";
import { ImagenField } from "./ImagenField";
import { VALORES_VACIOS, type ProductFormValues } from "./types";

interface ProductFormProps {
  initialValues?: ProductFormValues;
  initialImageUrl?: string | null;
  /** Código actual del producto (solo al editar). */
  codigoOriginal?: string;
  categorias: any[];
  cargandoCategorias?: boolean;
  permitirNuevaCategoria?: boolean;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (values: ProductFormValues, imagen: File | null) => void | Promise<void>;
}

const aNumero = (v: string): number | "" => (v === "" ? "" : Number(v));

export function ProductForm({
  initialValues = VALORES_VACIOS,
  initialImageUrl,
  codigoOriginal,
  categorias,
  cargandoCategorias,
  permitirNuevaCategoria,
  isSubmitting,
  submitLabel = "Guardar producto",
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [imagen, setImagen] = useState<File | null>(null);
  const codigo = useEstadoCodigo(values.code, codigoOriginal);

  const set = <K extends keyof ProductFormValues>(campo: K, valor: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (codigo.existe) {
      toast.error("El código ingresado ya existe. Ingresa uno diferente.");
      return;
    }
    if (!values.categoryName.trim()) {
      toast.error("Por favor selecciona o ingresa una categoría válida.");
      return;
    }

    onSubmit(
      { ...values, code: values.code.trim(), categoryName: values.categoryName.trim() },
      imagen
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl  p-4"
    >
      {/* Fila 1: Código y Categoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Código del Producto">
          <CodigoField value={values.code} onChange={(v) => set("code", v)} estado={codigo} />
        </FormField>

        <CategoriaField
          value={values.categoryName}
          onChange={(v) => set("categoryName", v)}
          categorias={categorias}
          cargando={cargandoCategorias}
          permitirNueva={permitirNuevaCategoria}
        />
      </div>

      {/* Fila 2: Nombre */}
      <FormField label="Nombre">
        <Input
          placeholder="Ej. Silla Gamer"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </FormField>

      {/* Fila 3: Precio y Stock */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Precio (Bs)">
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={values.price}
            onChange={(e) => set("price", aNumero(e.target.value))}
            required
          />
        </FormField>
        <FormField label="Stock">
          <Input
            type="number"
            placeholder="0"
            value={values.stock}
            onChange={(e) => set("stock", aNumero(e.target.value))}
            required
          />
        </FormField>
      </div>

      {/* Fila 4: Imagen del Producto */}
      <FormField label="Imagen del Producto">
        <ImagenField value={imagen} currentUrl={initialImageUrl} onChange={setImagen} />
      </FormField>

      {/* Fila 5: Descripción compacta */}
      <FormField label="Descripción">
        <textarea
          rows={2}
          placeholder="Detalles sobre el producto..."
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${FIELD_CLASS} resize-none`}
        />
      </FormField>

      {/* Acciones: Botones solo con ícono y Tooltip al hacer hover */}
      <div className="flex justify-end gap-2 border-t border-surface-border pt-3">
        {/* Botón Cancelar */}
        <div className="relative group">
          <Link href="/products">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              title="Cancelar"
              aria-label="Cancelar"
              className="h-9 w-9 p-0 flex items-center justify-center"
            >
              <X size={18} />
            </Button>
          </Link>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface-border text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
            Cancelar
          </span>
        </div>

        {/* Botón Guardar */}
        <div className="relative group">
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || codigo.validando || codigo.existe}
            title={isSubmitting ? "Guardando..." : submitLabel}
            aria-label={isSubmitting ? "Guardando..." : submitLabel}
            className="h-9 w-9 p-0 flex items-center justify-center"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          </Button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface-border text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
            {isSubmitting ? "Guardando..." : submitLabel}
          </span>
        </div>
      </div>
    </form>
  );
}