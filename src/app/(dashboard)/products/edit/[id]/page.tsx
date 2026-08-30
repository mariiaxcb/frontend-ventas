"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Package } from "lucide-react";
import toast from "react-hot-toast"; // 👈 Importación correcta
import { Button } from "@/components/ui/Button";
import { productosApi } from "@/services/productos.api";
import type { Categoria } from "@/types/producto";

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    stock: 0,
    description: "",
    categoryName: "",
  });

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const [productoData, listaCategorias] = await Promise.all([
          productosApi.obtener(id),
          productosApi.listarCategorias().catch(() => []),
        ]);

        setCategorias(listaCategorias || []);

        const p = productoData as any;
        const cat = p.category;

        let categoriaGuardada = "";
        if (typeof cat === "string") {
          categoriaGuardada = cat;
        } else if (typeof cat === "object" && cat !== null) {
          categoriaGuardada = cat.name || cat.nombre || cat.id || "";
        } else {
          categoriaGuardada = p.categoryName || p.categoria || "";
        }

        setFormData({
          name: p.name || "",
          price: Number(p.price) || 0,
          stock: p.stock || 0,
          description: p.description || "",
          categoryName: String(categoriaGuardada),
        });

        const rawImage = p.imageUrl || p.image;
        if (rawImage) {
          setImagePreview(typeof rawImage === "string" ? rawImage : rawImage.url || null);
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        toast.error("No se pudieron cargar los datos del producto");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", formData.price.toString());
      payload.append("stock", formData.stock.toString());
      payload.append("categoryName", formData.categoryName);

      if (formData.description) {
        payload.append("description", formData.description);
      }
      if (selectedFile) {
        payload.append("image", selectedFile);
      }

      await productosApi.actualizar(id, payload);

      // 🚀 Se muestra el toast directamente aquí
      toast.success("Producto actualizado correctamente");

      // Redirección y refresco de vista
      router.push("/products");
      router.refresh();
    } catch (error: any) {
      console.error("Error al actualizar el producto:", error);
      const mensajeError =
        error.response?.data?.message || "Ocurrió un error al guardar los cambios";
      toast.error(mensajeError);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        Cargando datos del producto...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="p-2 text-gray-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-poppins font-bold text-brand-cyan">
            Editar Producto
          </h1>
          <p className="text-xs text-gray-400">
            Modificando información del producto #{id}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4"
      >
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-300">
            Imagen del Producto
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0 relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={32} className="text-slate-700" />
              )}
            </div>

            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                id="product-image"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="product-image"
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg cursor-pointer border border-slate-700 transition-colors"
              >
                <ImageIcon size={14} />
                <span>{imagePreview ? "Cambiar imagen" : "Subir imagen"}</span>
              </label>
              <p className="text-[11px] text-gray-400 mt-1">
                Soporta PNG, JPG, WEBP.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Nombre del Producto
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Categoría
          </label>
          <select
            value={formData.categoryName}
            onChange={(e) =>
              setFormData({ ...formData, categoryName: e.target.value })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan"
            required
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categorias.map((cat: any) => {
              const valorNombre = typeof cat === "string" ? cat : (cat.name || cat.nombre || "");
              const valorId = cat.id ? String(cat.id) : valorNombre;

              return (
                <option key={valorId} value={valorNombre}>
                  {valorNombre}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Precio ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Stock
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: Number(e.target.value) })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Link href="/products">
            <Button type="button" variant="outline" disabled={submitting}>
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Guardar Cambios</span>
          </Button>
        </div>
      </form>
    </div>
  );
}