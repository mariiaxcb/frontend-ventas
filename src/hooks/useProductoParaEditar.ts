"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { productosApi } from "@/services/productos.api";
import type { ProductFormValues } from "@/components/productos/form/types";

function nombreCategoria(p: any): string {
  const cat = p.category;
  if (typeof cat === "string") return cat;
  if (cat && typeof cat === "object") return String(cat.name || cat.nombre || cat.id || "");
  return String(p.categoryName || p.categoria || "");
}

export function useProductoParaEditar(id: string) {
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [valores, setValores] = useState<ProductFormValues | null>(null);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);

        const [producto, listaCategorias] = await Promise.all([
          productosApi.obtener(id),
          productosApi.listarCategorias().catch(() => []),
        ]);

        const p = producto as any;
        setCategorias(listaCategorias || []);
        setValores({
          code: p.code || "",
          name: p.name || "",
          price: Number(p.price) || 0,
          stock: p.stock || 0,
          description: p.description || "",
          categoryName: nombreCategoria(p),
        });

        const raw = p.imageUrl || p.image;
        if (raw) setImagenUrl(typeof raw === "string" ? raw : raw.url || null);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        toast.error("No se pudieron cargar los datos del producto");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { loading, categorias, valores, imagenUrl };
}