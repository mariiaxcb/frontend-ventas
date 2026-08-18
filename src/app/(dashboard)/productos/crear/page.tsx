"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCrearProducto } from "@/hooks/useProductos";

export default function NuevoProductoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const crearProducto = useCrearProducto();

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [categoriaName, setCategoriaName] = useState("");
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
      console.log("📸 Imagen seleccionada:", {
        nombre: file.name,
        tamañoBytes: file.size,
        tipo: file.type,
      });
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoverImagen = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🗑️ Imagen removida");
    setImagenFile(null);
    setImagenPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: nombre,
      price: Number(precio),
      stock: Number(stock),
      categoryName: categoriaName,
      description: descripcion,
      image: imagenFile,
    };

    console.log("🚀 [SUBMIT] Preparando envío de datos:", {
      ...payload,
      image: imagenFile ? `Archivo: ${imagenFile.name} (${imagenFile.type})` : "Sin imagen",
    });

    try {
      const respuesta = await crearProducto.mutateAsync(payload);
      console.log("✅ [ÉXITO] Producto creado en el servidor:", respuesta);
      router.push("/productos");
    } catch (error: any) {
      console.error("❌ [ERROR] Falló la petición de creación de producto:");
      if (error.response) {
        // La API respondió con un status code de error (400, 404, 500, etc.)
        console.error("Status:", error.response.status);
        console.error("Headers de respuesta:", error.response.headers);
        console.error("Data devuelta por el Backend:", error.response.data);
      } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta (Error de red/CORS/Servidor apagado)
        console.error("No se recibió respuesta del servidor. Request:", error.request);
      } else {
        // Ocurrió un error configurando la petición
        console.error("Mensaje de error:", error.message);
      }
    }
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        {/* INPUT DE CATEGORÍA SIMPLE */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Categoría</label>
          <Input
            placeholder="Ej. Periféricos, Componentes, Muebles..."
            value={categoriaName}
            onChange={(e) => setCategoriaName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Precio</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value === "" ? "" : Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stock</label>
            <Input
              type="number"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* CARGA DE ARCHIVO DE IMAGEN */}
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