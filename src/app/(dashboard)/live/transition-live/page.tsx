"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LiveProductsPanel } from "@/components/live/LiveProductsPanel";
import { LiveChatPanel } from "@/components/live/LiveChatPanel";
import { NotificationPanel } from "@/components/live/NotificationPanel";
import { useLiveNotifications } from "@/hooks/useLiveNotifications";
import { useReservasTimeout } from "@/hooks/useReservasTimeout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import type { ProductoLive, NotificacionLive } from "@/types/live";
import type { ChatMensajeEvento, PostulanteEvento } from "@/types/socket";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const TIKTOK_TIMEOUT_MS = 180000; // 3 minutos
const WPP_TIMEOUT_MS = 300000; // 5 minutos

interface ActiveStream {
  id: number;
  title: string;
  tiktokUsername: string;
  startDate: string;
  endDate: string | null;
  status: string;
  adminId: number;
}

interface Product {
  id: number;
  code: string;
  name: string;
  price: string | number;
  stock: number;
  description: string;
  status: string;
  imageUrl: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
    status: string;
  };
}

export default function TransitionLivePage() {
  const { token } = useAuth();
  const [activeStream, setActiveStream] = useState<ActiveStream | null>(null);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [tiktokUsername, setTiktokUsername] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<ChatMensajeEvento[]>([]);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productosLive, setProductosLive] = useState<ProductoLive[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFetchingProducts, setIsFetchingProducts] = useState<boolean>(false);
  const [processingProductCode, setProcessingProductCode] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const activeUserRef = useRef<string>("");
  const { notificaciones, agregarNotificacion, limpiarNotificaciones } = useLiveNotifications();

  // Manejo de timeouts de reservas
  const handleReservaTimeout = useCallback(
    (reserva: { usuarioTiktok: string; productoCode: string; productoNombre: string }) => {
      agregarNotificacion({
        tipo: "timeout_tiktok",
        mensaje: `@${reserva.usuarioTiktok} perdió la reserva de ${reserva.productoNombre} (3 min sin confirmar en WhatsApp)`,
        usuarioTiktok: reserva.usuarioTiktok,
        productoCode: reserva.productoCode,
        productoNombre: reserva.productoNombre,
      });
    },
    [agregarNotificacion]
  );

  const { agregarReserva, confirmarReserva } = useReservasTimeout(handleReservaTimeout);

  // Cargar stream activo
  useEffect(() => {
    const fetchActiveStream = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/streams/active`, {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const jsonResponse = await res.json();
          if (jsonResponse.success && jsonResponse.data) {
            setActiveStream(jsonResponse.data);
            activeUserRef.current = jsonResponse.data.tiktokUsername;
            setIsConnected(true);
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

  // Conexión Socket.IO
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

    // Nuevo comentario en el chat
    socketInstance.on("chat:mensaje", (data: ChatMensajeEvento) => {
      setComments((prev) => {
        const exists = prev.some(
          (c) => c.usuarioTiktok === data.usuarioTiktok && c.mensaje === data.mensaje
        );
        if (exists) return prev;
        return [data, ...prev].slice(0, 100);
      });
    });

    // Nuevo postulante (reserva desde TikTok)
    socketInstance.on("live:postulante", (data: PostulanteEvento) => {
      // Actualizar productos live
      setProductosLive((prev) =>
        prev.map((p) =>
          p.code === data.productoId
            ? { ...p, reservados: data.reservados ?? p.reservados + 1 }
            : p
        )
      );

      // Notificación de reserva
      agregarNotificacion({
        tipo: "reserva",
        mensaje: `@${data.usuarioTiktok} reservó ${data.productoNombre || data.productoId}`,
        usuarioTiktok: data.usuarioTiktok,
        productoCode: data.productoId,
        productoNombre: data.productoNombre,
      });

      // Agregar timeout de 3 minutos para TikTok
      agregarReserva({
        id: `tiktok-${data.usuarioTiktok}-${data.productoId}-${Date.now()}`,
        usuarioTiktok: data.usuarioTiktok,
        productoCode: data.productoId,
        productoNombre: data.productoNombre || data.productoId,
        timeoutMs: TIKTOK_TIMEOUT_MS,
      });

      // Verificar si el producto se agotó
      if (data.reservados && data.limite && data.reservados >= data.limite) {
        agregarNotificacion({
          tipo: "producto_agotado",
          mensaje: `¡${data.productoNombre || data.productoId} tiene todas las reservas completas!`,
          productoCode: data.productoId,
          productoNombre: data.productoNombre,
        });
      }
    });

    // Pedido actualizado (confirmación desde WhatsApp)
    socketInstance.on("pedido:actualizado", (data: any) => {
      if (data.pedido) {
        const pedido = data.pedido;

        // Notificación de confirmación
        agregarNotificacion({
          tipo: "confirmacion",
          mensaje: `@${pedido.buyer?.tiktokUsername || "Cliente"} confirmó su reserva #${pedido.id}`,
          usuarioTiktok: pedido.buyer?.tiktokUsername,
          pedidoId: pedido.id,
        });

        // Confirmar reserva (cancelar timeout)
        confirmarReserva(`tiktok-${pedido.buyer?.tiktokUsername}-${pedido.productCode}-${pedido.id}`);

        // Actualizar productos live
        setProductosLive((prev) =>
          prev.map((p) =>
            p.code === pedido.productCode
              ? { ...p, vendidos: p.vendidos + 1, reservados: Math.max(0, p.reservados - 1) }
              : p
          )
        );
      }
    });

    // Pedido nuevo
    socketInstance.on("pedido:nuevo", (data: any) => {
      if (data.pedido) {
        const pedido = data.pedido;

        agregarNotificacion({
          tipo: "confirmacion",
          mensaje: `Nuevo pedido #${pedido.id} de @${pedido.buyer?.tiktokUsername || "Cliente"}`,
          usuarioTiktok: pedido.buyer?.tiktokUsername,
          pedidoId: pedido.id,
        });
      }
    });

    return () => {
      socketInstance.off("chat:mensaje");
      socketInstance.off("live:postulante");
      socketInstance.off("pedido:actualizado");
      socketInstance.off("pedido:nuevo");
      socketInstance.disconnect();
    };
  }, [token, agregarNotificacion, agregarReserva, confirmarReserva]);

  const fetchAllProducts = async () => {
    if (!token) return;
    setIsFetchingProducts(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/products`, {
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
    }
  };

  const handleOpenProductModal = () => {
    setIsProductModalOpen(true);
    fetchAllProducts();
  };

  const toggleProductInStream = async (product: Product) => {
    if (!activeStream || !token) return;

    const isAlreadyAdded = productosLive.some((p) => p.code === product.code);
    setProcessingProductCode(product.code);

    try {
      if (isAlreadyAdded) {
        const res = await fetch(
          `${BACKEND_URL}/api/streams/${activeStream.id}/products/${product.code}`,
          {
            method: "DELETE",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          setProductosLive((prev) => prev.filter((p) => p.code !== product.code));
        }
      } else {
        const res = await fetch(`${BACKEND_URL}/api/streams/${activeStream.id}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productCode: product.code }),
        });
        if (res.ok) {
          const nuevoProducto: ProductoLive = {
            id: product.id,
            code: product.code,
            name: product.name,
            price: Number(product.price),
            stock: product.stock,
            imageUrl: product.imageUrl,
            reservados: 0,
            vendidos: 0,
          };
          setProductosLive((prev) => [...prev, nuevoProducto]);
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
          Authorization: `Bearer ${token}`,
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
        });
        activeUserRef.current = cleanUsername;
        setComments([]);
        setProductosLive([]);
        limpiarNotificaciones();

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
          Authorization: `Bearer ${token}`,
        },
      });
      activeUserRef.current = "";
      setIsConnected(false);
      setActiveStream(null);
      setTitle("");
      setTiktokUsername("");
      setShowEndModal(false);
      setProductosLive([]);
      limpiarNotificaciones();
    } catch (error) {
      console.error("Error stopping stream:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidarPago = async (pedidoId: number) => {
    try {
      await fetch(`${BACKEND_URL}/api/orders/${pedidoId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "PAID" }),
      });

      agregarNotificacion({
        tipo: "producto_vendido",
        mensaje: `Pago validado para el pedido #${pedidoId}`,
        pedidoId,
      });
    } catch (error) {
      console.error("Error validating payment:", error);
    }
  };

  const handleRechazarPago = async (pedidoId: number) => {
    try {
      await fetch(`${BACKEND_URL}/api/orders/${pedidoId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      agregarNotificacion({
        tipo: "timeout_wpp",
        mensaje: `Pago rechazado para el pedido #${pedidoId}`,
        pedidoId,
      });
    } catch (error) {
      console.error("Error rejecting payment:", error);
    }
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (verifying) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        Verificando transmisiones...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-brand-primary/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-poppins text-2xl font-bold tracking-wide text-brand-cyan">
            Transmisión en TikTok Live
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {!activeStream
              ? "Inicia una nueva transmisión configurando el título y el usuario de TikTok."
              : "Captura de comentarios y confirmación manual de pedidos a la BD."}
          </p>
        </div>

        {activeStream && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-brand-primary/20 bg-brand-dark px-3 py-1.5 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    isConnected ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                ></span>
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    isConnected ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                ></span>
              </span>
              <span className="font-medium text-slate-300">
                {isConnected ? "En vivo" : "Desconectado"}
              </span>
            </div>

            <div className="rounded-lg border border-brand-primary/20 bg-brand-dark px-3 py-1.5 text-xs text-slate-300">
              En cola: <span className="font-bold text-brand-cyan">{comments.length}</span>
            </div>
          </div>
        )}
      </div>

      {!activeStream ? (
        <div className="mx-auto mt-10 max-w-xl rounded-xl border border-brand-primary/20 bg-brand-dark p-6 shadow-lg">
          <h2 className="mb-4 text-base font-semibold text-slate-200">
            Configurar Nueva Transmisión
          </h2>
          <form onSubmit={handleCreateStream} className="flex flex-col gap-4">
            <div className="w-full">
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Título de la transmisión *
              </label>
              <Input
                type="text"
                placeholder="ej. Gran Remate de Verano"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Usuario de TikTok (sin @) *
              </label>
              <Input
                type="text"
                placeholder="ej. mi_tienda_live"
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Iniciando..." : "Iniciar Transmisión"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-xl border border-brand-primary/20 bg-brand-dark p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div>
                <span className="text-xs font-medium text-slate-400">Título: </span>
                <span className="text-sm font-semibold text-slate-100">{activeStream.title}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">Usuario de TikTok: </span>
                <span className="text-sm font-semibold text-brand-cyan">
                  @{activeStream.tiktokUsername}
                </span>
              </div>
            </div>

            <Button variant="danger" onClick={() => setShowEndModal(true)} disabled={isLoading}>
              Finalizar Live
            </Button>
          </div>

          <div className="grid h-[calc(80vh-10rem)] min-h-[600px] grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Panel izquierdo: Productos + Chat */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="h-1/2">
                <LiveProductsPanel productos={productosLive} onAddProduct={handleOpenProductModal} />
              </div>
              <div className="h-1/2">
                <LiveChatPanel mensajes={comments} />
              </div>
            </div>

            {/* Panel derecho: Notificaciones */}
            <div className="lg:col-span-1">
              <NotificationPanel
                notificaciones={notificaciones}
                onValidarPago={handleValidarPago}
                onRechazarPago={handleRechazarPago}
              />
            </div>
          </div>
        </>
      )}

      {/* Modal de productos */}
      {isProductModalOpen && (
        <Modal
          abierto={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          titulo="Seleccionar Productos"
        >
          <div className="space-y-4">
            <Input
              placeholder="Buscar por nombre de producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-[50vh] space-y-2 overflow-y-auto">
              {isFetchingProducts ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  Cargando productos...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No se encontraron productos.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isAdded = productosLive.some((p) => p.code === product.code);
                  const isProcessing = processingProductCode === product.code;

                  return (
                    <div
                      key={product.code}
                      className="flex items-center justify-between rounded-lg border border-brand-primary/10 bg-brand-darkest/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-primary/10">
                            <Package size={16} className="text-slate-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-200">{product.name}</p>
                          <p className="text-xs text-slate-400">
                            Cód: {product.code} · Stock: {product.stock} · ${product.price}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={isAdded ? "danger" : "primary"}
                        className="min-w-[80px] py-1.5 text-xs"
                        onClick={() => toggleProductInStream(product)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "..." : isAdded ? "Quitar" : "Agregar"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación para finalizar */}
      {showEndModal && (
        <Modal
          abierto={showEndModal}
          onClose={() => setShowEndModal(false)}
          titulo="Finalizar Transmisión"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Estás a punto de finalizar el monitoreo en vivo de{" "}
              <span className="font-semibold text-brand-cyan">
                @{activeStream?.tiktokUsername}
              </span>
              . Esta acción detendrá la lectura de comentarios.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEndModal(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleStopStream} disabled={isLoading}>
                {isLoading ? "Finalizando..." : "Sí, finalizar"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
