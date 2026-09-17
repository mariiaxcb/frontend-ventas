"use client";

import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { ChatStream } from "@/components/live/ChatStream";
import { ListaPostulantes } from "@/components/live/ListaPostulantes";
import { useAuth } from "@/context/AuthContext";

export interface FilteredComment {
  user: string;
  nickname: string;
  profilePic: string;
  comment: string;
  date: string;
  fecha?: string;
  uniqueId?: string;
  profilePictureUrl?: string;
  usuario?: string;
  comentario?: string;
}

export interface Category {
  id: number;
  name: string;
  status: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  price: string | number;
  stock: number;
  description: string;
  status: string;
  imageUrl: string;
  categoryId: number;
  category: Category;
}

interface ActiveStream {
  id: number;
  title: string;
  tiktokUsername: string;
  startDate: string;
  endDate: string | null;
  status: string;
  adminId: number;
  _count?: {
    orders: number;
  };
  products?: Product[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function TransitionLivePage() {
  const { token } = useAuth();
  const [activeStream, setActiveStream] = useState<ActiveStream | null>(null);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [dbSalesCount, setDbSalesCount] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [tiktokUsername, setTiktokUsername] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<FilteredComment[]>([]);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [streamProducts, setStreamProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFetchingProducts, setIsFetchingProducts] = useState<boolean>(false);
  const [processingProductCode, setProcessingProductCode] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const activeUserRef = useRef<string>("");

  useEffect(() => {
    const fetchActiveStream = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/streams/active`, {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const jsonResponse = await res.json();
          if (jsonResponse.success && jsonResponse.data) {
            setActiveStream(jsonResponse.data);
            activeUserRef.current = jsonResponse.data.tiktokUsername;
            setIsConnected(true);
            if (jsonResponse.data._count && typeof jsonResponse.data._count.orders === "number") {
              setDbSalesCount(jsonResponse.data._count.orders);
            }
            if (jsonResponse.data.products && Array.isArray(jsonResponse.data.products)) {
              setStreamProducts(jsonResponse.data.products);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching active stream:", error);
      } finally {
        setVerifying(false);
      }
    };

    fetchActiveStream();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socketInstance: Socket = io(BACKEND_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      if (activeUserRef.current) {
        socketInstance.emit("live:unirse", activeUserRef.current);
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("nueva_intencion_compra", (newComment: FilteredComment) => {
      setComments((prev) => {
        const timestamp = newComment.date || newComment.fecha || new Date().toISOString();
        const commentWithId = {
          ...newComment,
          date: timestamp,
        };

        const alreadyExists = prev.some(
          (c) =>
            (c.comment === commentWithId.comment || c.comentario === commentWithId.comentario) &&
            c.date === timestamp &&
            (c.nickname === commentWithId.nickname || c.user === commentWithId.user)
        );

        if (alreadyExists) return prev;
        return [commentWithId, ...prev];
      });
    });

    return () => {
      socketInstance.off("nueva_intencion_compra");
      socketInstance.disconnect();
    };
  }, [token]);

  const fetchAllProducts = async () => {
    if (!token) return;
    setIsFetchingProducts(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/products`, {
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
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
    }
  };

  const handleOpenProductModal = () => {
    setIsProductModalOpen(true);
    fetchAllProducts();
  };

  const toggleProductInStream = async (product: Product) => {
    if (!activeStream || !token) return;
    
    const isAlreadyAdded = streamProducts.some(p => p.code === product.code);
    setProcessingProductCode(product.code);

    try {
      if (isAlreadyAdded) {
        const res = await fetch(`${BACKEND_URL}/api/streams/${activeStream.id}/products/${product.code}`, {
          method: "DELETE",
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          setStreamProducts(prev => prev.filter(p => p.code !== product.code));
        }
      } else {
        const res = await fetch(`${BACKEND_URL}/api/streams/${activeStream.id}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ productCode: product.code })
        });
        if (res.ok) {
          setStreamProducts(prev => [...prev, product]);
        }
      }
    } catch (error) {
      console.error("Error toggling product:", error);
    } finally {
      setProcessingProductCode(null);
    }
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Ingresa un título para la transmisión");
    const cleanUsername = tiktokUsername.replace(/^@/, "").trim();
    if (!cleanUsername) return alert("Ingresa un usuario de TikTok");

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/tiktok/iniciar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          tiktokUsername: cleanUsername,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const streamData = data.data || data;
        setActiveStream({
          id: streamData.id || 1,
          title: title.trim(),
          tiktokUsername: cleanUsername,
          startDate: new Date().toISOString(),
          endDate: null,
          status: "LIVE",
          adminId: 1,
          products: []
        });
        activeUserRef.current = cleanUsername;
        setComments([]);
        setStreamProducts([]);

        if (socketRef.current) {
          socketRef.current.emit("live:unirse", cleanUsername);
        }
        setIsConnected(true);
      } else {
        alert(`Error: ${data.error || "No se pudo conectar al Live"}`);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Error de conexión con el servidor backend");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = async () => {
    setIsLoading(true);
    try {
      await fetch(`${BACKEND_URL}/api/tiktok/detener`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      activeUserRef.current = "";
      setIsConnected(false);
      setActiveStream(null);
      setTitle("");
      setTiktokUsername("");
      setShowEndModal(false);
      setStreamProducts([]);
    } catch (error) {
      console.error("Error stopping stream:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (verifying) {
    return <div className="text-center py-10 text-slate-400 text-sm">Verificando transmisiones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
            Transmisión en TikTok Live
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {!activeStream
              ? "Inicia una nueva transmisión configurando el título y el usuario de TikTok."
              : "Captura de comentarios y confirmación manual de pedidos a la BD."}
          </p>
        </div>

        {activeStream && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isConnected ? "bg-emerald-400" : "bg-amber-400"
                  } opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isConnected ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                ></span>
              </span>
              <span className="text-slate-300 font-medium">
                {isConnected ? "En vivo" : "Desconectado"}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              En cola (RAM): <span className="font-bold text-brand-cyan">{comments.length}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              Ventas (BD): <span className="font-bold text-emerald-400">{dbSalesCount}</span>
            </div>
          </div>
        )}
      </div>

      {!activeStream ? (
        <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-lg mt-10">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Configurar Nueva Transmisión</h2>
          <form onSubmit={handleCreateStream} className="flex flex-col gap-4">
            <div className="w-full">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Título de la transmisión *
              </label>
              <input
                type="text"
                placeholder="ej. Gran Remate de Verano"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="w-full">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Usuario de TikTok (sin @) *
              </label>
              <input
                type="text"
                placeholder="ej. mi_tienda_live"
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-brand-cyan hover:bg-cyan-600 transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? "Iniciando..." : "▶️ Iniciar Transmisión"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div>
                <span className="text-xs text-slate-400 font-medium">Título: </span>
                <span className="text-sm font-semibold text-slate-100">{activeStream.title}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Usuario de TikTok: </span>
                <span className="text-sm font-semibold text-brand-cyan">@{activeStream.tiktokUsername}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-60"
            >
              🛑 Finalizar Live
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(80vh-10rem)] min-h-[600px]">
            <div className="flex flex-col gap-4 h-full">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col h-1/2">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-200">Productos en Oferta</h3>
                  <button
                    onClick={handleOpenProductModal}
                    className="px-3 py-1.5 bg-brand-cyan hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg transition-colors"
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
                              <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded object-cover bg-slate-800" />
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

              <div className="flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                <ChatStream comentarios={comments} />
              </div>
            </div>

            <div className="h-full">
              <ListaPostulantes streamId={activeStream.id} onVentaConfirmada={() => setDbSalesCount((prev) => prev + 1)} />
            </div>
          </div>
        </>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-xl">
              <h3 className="text-lg font-bold text-slate-100">Seleccionar Productos</h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
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
                <div className="text-center py-10 text-slate-400 text-sm">Cargando productos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">No se encontraron productos.</div>
              ) : (
                filteredProducts.map((product) => {
                  const isAdded = streamProducts.some(p => p.code === product.code);
                  const isProcessing = processingProductCode === product.code;

                  return (
                    <div key={product.code} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:bg-slate-800/60 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover bg-slate-900" />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200">{product.name}</h4>
                          <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                            <span>Cód: <span className="text-slate-300">{product.code}</span></span>
                            <span>Stock: <span className="text-brand-cyan font-bold">{product.stock}</span></span>
                            <span className="text-emerald-400 font-medium">${product.price}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleProductInStream(product)}
                        disabled={isProcessing}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all min-w-[90px] ${
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

      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">¿Finalizar Transmisión?</h3>
            <p className="text-xs text-slate-300">
              Estás a pronto de finalizar el monitoreo en vivo de <span className="font-semibold text-brand-cyan">@{activeStream?.tiktokUsername}</span>. Esta acción detendrá la lectura de comentarios.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStopStream}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? "Finalizando..." : "Sí, finalizar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}