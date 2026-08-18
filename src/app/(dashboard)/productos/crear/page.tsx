"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCrearProducto, useCategorias, useCrearCategoria } from "@/hooks/useProductos";
import type { ProductoInput } from "@/types/producto";

export default function NuevoProductoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const crearProducto = useCrearProducto();
  const { data: categorias } = useCategorias();
  const crearCategoria = useCrearCategoria();

  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");

  const [nuevo, setNuevo] = useState<ProductoInput>({
    nombre: "",
    precio: 0,
    stock: 0,
    descripcion: "",
    imagen: "",
    categoria: "",
    estado: "ACTIVE",
  });

  const handleSeleccionarArchivo = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUri = URL.createObjectURL(file);
      setNuevo({ ...nuevo, imagen: imageUri });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let categoriaFinal = nuevo.categoria;

    // Si el usuario activó la opción de nueva categoría y escribió un nombre, la creamos primero
    if (creandoCategoria && nuevaCategoriaNombre.trim()) {
      const nuevaCat = await crearCategoria.mutateAsync(nuevaCategoriaNombre.trim());
      categoriaFinal = nuevaCat.nombre; // o nuevaCat.id según tu API
    }

    // Guardamos el producto con la categoría final asignada
    await crearProducto.mutateAsync({
      ...nuevo,
      categoria: categoriaFinal,
    });

    router.push("/productos");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" type="button" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-poppins font-bold text-brand-cyan">
          Agregar Nuevo Producto
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
          <Input
            placeholder="Ej. Silla Gamer"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            required
          />
        </div>

        {/* SELECT / INPUT DE CATEGORÍA */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Categoría</label>
          {!creandoCategoria ? (
            <div className="flex gap-2">
              <select
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                value={nuevo.categoria}
                onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
                required
              >
                <option value="">Selecciona una categoría</option>
                {(categorias ?? []).map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreandoCategoria(true)}
                title="Escribir nueva categoría"
              >
                <Plus size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Escribe el nombre de la nueva categoría..."
                value={nuevaCategoriaNombre}
                onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreandoCategoria(false);
                  setNuevaCategoriaNombre("");
                }}
                title="Volver a la lista de categorías"
              >
                <X size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Precio</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={nuevo.precio || ""}
              onChange={(e) => setNuevo({ ...nuevo, precio: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stock</label>
            <Input
              type="number"
              placeholder="0"
              value={nuevo.stock || ""}
              onChange={(e) => setNuevo({ ...nuevo, stock: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        {/* IMAGEN DEL PRODUCTO */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Imagen del Producto</label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={handleSeleccionarArchivo}
            className="w-full h-36 border-2 border-dashed border-slate-800 hover:border-brand-cyan rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/50 hover:bg-slate-950 group relative overflow-hidden"
          >
            {nuevo.imagen ? (
              <div className="relative w-full h-full">
                <img
                  src={nuevo.imagen}
                  alt="Previsualización"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNuevo({ ...nuevo, imagen: "" });
                  }}
                  className="absolute top-2 right-2 bg-red-600/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-brand-cyan transition-colors">
                <Upload size={28} />
                <span className="text-xs font-medium">
                  Haz clic para examinar y subir una imagen desde tu equipo
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
            value={nuevo.descripcion}
            onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Producto</Button>
        </div>
      </form>
    </div>
  );
}