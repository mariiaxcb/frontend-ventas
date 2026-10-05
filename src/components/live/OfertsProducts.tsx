"use client";

import { useState } from "react";
import { Product } from "@/types/live"; 

interface ProductosEnOfertaProps {
  streamProducts: Product[];
  activeStreamId: number;
  token: string | null;
  backendUrl: string;
  onStreamProductsChange: (products: Product[]) => void;
}

export function ProductosEnOferta({
  streamProducts,
  activeStreamId,
  token,
  backendUrl,
  onStreamProductsChange,
}: ProductosEnOfertaProps) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [processingProductCode, setProcessingProductCode] = useState<string | null>(null);

  const fetchAllProducts = async () => {
    if (!token) return;
    setIsFetchingProducts(true);
    try {
      const res = await fetch(`${backendUrl}/api/products`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const jsonResponse = await res.json();
        if (jsonResponse.success && jsonResponse.data) {
          setAllProducts(jsonResponse.data);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsFetchingProducts(false);
    } // <-- Se agregó la llave de cierre faltante
  };

  const handleOpenProductModal = () => {
    setIsProductModalOpen(true);
    fetchAllProducts();
  };

  const toggleProductInStream = async (product: Product) => {
    if (!activeStreamId || !token) return;

    const isAlreadyAdded = streamProducts.some((p) => p.code === product.code);
    setProcessingProductCode(product.code);

    try {
      if (isAlreadyAdded) {
        const res = await fetch(
          `${backendUrl}/api/streams/${activeStreamId}/products/${product.code}`,
          {
            method: "DELETE",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          onStreamProductsChange(streamProducts.filter((p) => p.code !== product.code));
        }
      } else {
        const res = await fetch(`${backendUrl}/api/streams/${activeStreamId}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productCode: product.code }),
        });
        if (res.ok) {
          onStreamProductsChange([...streamProducts, product]);
        }
      }
    } catch (error) {
      console.error("Error toggling product:", error);
    } finally {
      setProcessingProductCode(null);
    }
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col h-1/2">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200">Productos en Oferta</h3>
          <button
            onClick={handleOpenProductModal}
            className="px-3 py-1.5 bg-brand-cyan hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Ofertar Producto
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-0">
          {streamProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No hay productos ofertados en esta transmisión.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2 font-medium">Producto</th>
                  <th className="px-4 py-2 font-medium">Código</th>
                  <th className="px-4 py-2 font-medium">Precio</th>
                  <th className="px-4 py-2 font-medium text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {streamProducts.map((p) => (
                  <tr key={p.code} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover bg-slate-800"
                      />
                      <span className="font-medium text-slate-200 line-clamp-1">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{p.code}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">${p.price}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-base font-bold text-brand-cyan bg-cyan-500/10 px-2 py-1 rounded">
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-xl">
              <h3 className="text-lg font-bold text-slate-100">Seleccionar Productos</h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-slate-800">
              <input
                type="text"
                placeholder="Buscar por nombre de producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isFetchingProducts ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Cargando productos...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No se encontraron productos.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isAdded = streamProducts.some((p) => p.code === product.code);
                  const isProcessing = processingProductCode === product.code;

                  return (
                    <div
                      key={product.code}
                      className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover bg-slate-900"
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200">{product.name}</h4>
                          <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                            <span>
                              Cód: <span className="text-slate-300">{product.code}</span>
                            </span>
                            <span>
                              Stock:{" "}
                              <span className="text-brand-cyan font-bold">{product.stock}</span>
                            </span>
                            <span className="text-emerald-400 font-medium">${product.price}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleProductInStream(product)}
                        disabled={isProcessing}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all min-w-[90px] cursor-pointer ${
                          isAdded
                            ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                        } disabled:opacity-50`}
                      >
                        {isProcessing ? "..." : isAdded ? "Quitar" : "Agregar"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}