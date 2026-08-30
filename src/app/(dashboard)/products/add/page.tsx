"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCrearProducto, useCategorias } from "@/hooks/useProductos";

export default function NuevoProductoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const crearProducto = useCrearProducto();
  const { data: categorias, isLoading: cargandoCategorias } = useCategorias();

  const [esNuevaCategoria, setEsNuevaCategoria] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Manejo de la imagen
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  const handleSeleccionarArchivo = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoverImagen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagenFile(null);
    setImagenPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cambiar entre select e input manual
  const toggleModoCategoria = () => {
    setEsNuevaCategoria(!esNuevaCategoria);
    // Limpiamos los valores al alternar de modo
    setCategoriaSeleccionada("");
    setNuevaCategoria("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const categoriaFinal = esNuevaCategoria
      ? nuevaCategoria.trim()
      : categoriaSeleccionada;

    if (!categoriaFinal) {
      toast.error("Por favor selecciona o ingresa una categoría válida.");
      return;
    }

    const payload = {
      name: nombre,
      price: Number(precio),
      stock: Number(stock),
      categoryName: categoriaFinal,
      description: descripcion,
      image: imagenFile,
    };

    try {
      await crearProducto.mutateAsync(payload);

      // 🚀 Notificación al crear exitosamente
      toast.success("Producto creado con éxito");

      // Redirección y actualización de la ruta
      router.push("/products");
      router.refresh();
    } catch (error: any) {
      console.error("❌ Error al crear producto:", error);
      const mensajeError =
        error.response?.data?.message || "Ocurrió un error al crear el producto";
      toast.error(mensajeError);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" type="button" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-poppins font-bold text-brand-cyan">
          Agregar Nuevo Producto
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4"
      >
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
          <Input
            placeholder="Ej. Silla Gamer"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        {/* CAMPO CATEGORÍA CON BOTÓN TOGGLE */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            {esNuevaCategoria ? "Escribir Nueva Categoría" : "Categoría"}
          </label>

          <div className="flex gap-2">
            {esNuevaCategoria ? (
              <Input
                placeholder="Ej. Periféricos"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                required
              />
            ) : (
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan"
              >
                <option value="" disabled>
                  {cargandoCategorias
                    ? "Cargando categorías..."
                    : "Selecciona una categoría"}
                </option>
                {categorias?.map((cat: any) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={toggleModoCategoria}
              title={
                esNuevaCategoria
                  ? "Seleccionar existente"
                  : "Agregar nueva categoría"
              }
              className="px-3 flex-shrink-0"
            >
              {esNuevaCategoria ? <X size={18} /> : <Plus size={18} />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Precio</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={precio}
              onChange={(e) =>
                setPrecio(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stock</label>
            <Input
              type="number"
              placeholder="0"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
            />
          </div>
        </div>

        {/* CARGA DE ARCHIVO DE IMAGEN */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Imagen del Producto
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={handleSeleccionarArchivo}
            className="w-full h-36 border-2 border-dashed border-slate-800 hover:border-brand-cyan rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/50 hover:bg-slate-950 relative overflow-hidden"
          >
            {imagenPreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagenPreview}
                  alt="Previsualización"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={handleRemoverImagen}
                  className="absolute top-2 right-2 bg-red-600/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-brand-cyan transition-colors">
                <Upload size={28} />
                <span className="text-xs font-medium">
                  Haz clic para examinar y subir una imagen
                </span>
                <span className="text-[10px] text-gray-500">
                  PNG, JPG, WEBP, SVG
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Descripción</label>
          <textarea
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            rows={4}
            placeholder="Detalles sobre el producto..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={crearProducto.isPending}>
            {crearProducto.isPending ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
}