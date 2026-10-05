"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { Package } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/api.client";
import { LiveProductsPanel } from "@/components/live/LiveProductsPanel";
import { NotificationPanel } from "@/components/live/NotificationPanel";
import { ProductPickerRow } from "@/components/live/ProductPickerRow";
import { useLiveNotifications } from "@/hooks/useLiveNotifications";
import { useBotStatus } from "@/hooks/useBotStatus";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { formatoMoneda } from "@/lib/utils";
import type { ProductoLive, NotificacionLive } from "@/types/live";
import type { ChatMensajeEvento, PostulanteEvento } from "@/types/socket";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

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
  const router = useRouter();
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

  // El bot debe estar conectado: sin él no hay confirmación de pagos por WPP.
  const { data: botSession } = useBotStatus();
  const botStatus = botSession?.status ?? "DISCONNECTED";
  const botConectado = botStatus === "CONNECTED";

  /**
   * El backend es quien vence las reservas y las marca como CANCELLED, para
   * que el estado persista aunque el vendedor cierre la aplicación. Aquí solo
   * se refleja lo que el backend ya decidió.
   */
  const handleReservaCancelada = useCallback(
    (reserva: {
      tiktokUsername: string;
      productCode: string;
      productName: string;
    }) => {
      agregarNotificacion({
        tipo: "timeout_tiktok",
        mensaje: `@${reserva.tiktokUsername} perdió la reserva de ${reserva.productName} (3 min sin confirmar en WhatsApp)`,
        usuarioTiktok: reserva.tiktokUsername,
        productoCode: reserva.productCode,
        productoNombre: reserva.productName,
      });

      // El cupo vuelve a estar disponible para otro comprador.
      setProductosLive((prev) =>
        prev.map((p) =>
          p.code === reserva.productCode
            ? { ...p, reservados: Math.max(0, p.reservados - 1) }
            : p
        )
      );
    },
    [agregarNotificacion]
  );

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

    // Nuevo comentario en el chat (todos los comentarios)
    socketInstance.on("chat:mensaje", (data: ChatMensajeEvento) => {
      setComments((prev) => {
        const exists = prev.some(
          (c) => c.usuarioTiktok === data.usuarioTiktok && c.mensaje === data.mensaje
        );
        if (exists) return prev;
        return [data, ...prev].slice(0, 100);
      });
    });

    // Intención de compra (comentario con código de producto)
    socketInstance.on("nueva_intencion_compra", (data: any) => {
      const comentario: ChatMensajeEvento = {
        usuarioTiktok: data.usuario || data.usuarioTiktok || "Usuario",
        mensaje: data.comentario || data.comment || data.mensaje || "",
        timestamp: data.fecha || data.timestamp || new Date().toISOString(),
      };

      setComments((prev) => {
        const exists = prev.some(
          (c) => c.usuarioTiktok === comentario.usuarioTiktok && c.mensaje === comentario.mensaje
        );
        if (exists) return prev;
        return [comentario, ...prev].slice(0, 100);
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

      // El vencimiento de esta reserva lo controla el backend: él la marca
      // como CANCELLED y avisa por socket. Aquí no duplicamos el temporizador.

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

    // Pedido nuevo (se emite cuando el bot crea el pedido en WPP)
    socketInstance.on("pedido:nuevo", (data: any) => {
      if (data.pedido) {
        const pedido = data.pedido;

        // Notificación de nuevo pedido
        agregarNotificacion({
          tipo: "confirmacion",
          mensaje: `Nuevo pedido #${pedido.id} de @${pedido.buyer?.tiktokUsername || "Cliente"}`,
          usuarioTiktok: pedido.buyer?.tiktokUsername,
          pedidoId: pedido.id,
        });

        // El cliente confirmó su reserva en WhatsApp. La reserva ya fue marcada
        // como CLAIMED al crear la orden, así que el backend no la vencerá
        // y no llegará ninguna notificación de cancelación.
        const productCode = (pedido.orderItems?.[0]?.product?.code || pedido.productCode || "")
          .toString()
          .toUpperCase()
          .trim();

        // Actualizar productos live - decrementar reservados
        setProductosLive((prev) =>
          prev.map((p) =>
            p.code === productCode
              ? { ...p, reservados: Math.max(0, p.reservados - 1) }
              : p
          )
        );
      }
    });

    // Pedido actualizado (cambio de estado: IN_REVIEW, PAID, REJECTED, etc.)
    socketInstance.on("pedido:actualizado", (data: any) => {
      if (data.pedido) {
        const pedido = data.pedido;

        // Solo notificar si no es un pedido nuevo (para evitar duplicados)
        // Si el estado es PENDING, es un pedido nuevo y ya se notificó con pedido:nuevo
        if (pedido.status !== 'PENDING') {
          // Verificar si ya existe una notificación para este pedido con el mismo estado
          const yaNotificado = notificaciones.some(
            (n) => n.pedidoId === pedido.id && n.mensaje.includes(`#${pedido.id}`)
          );

          if (!yaNotificado) {
            // Notificación de actualización de estado
            let mensaje = '';
            if (pedido.status === 'IN_REVIEW') {
              mensaje = `Pedido #${pedido.id} en revisión de pago`;
            } else if (pedido.status === 'PAID') {
              mensaje = `Pago validado para el pedido #${pedido.id}`;
            } else if (pedido.status === 'REJECTED') {
              mensaje = `Pago rechazado para el pedido #${pedido.id}`;
            } else {
              mensaje = `Pedido #${pedido.id} actualizado a ${pedido.status}`;
            }

            agregarNotificacion({
              tipo: pedido.status === 'PAID' ? 'producto_vendido' : 'confirmacion',
              mensaje,
              usuarioTiktok: pedido.buyer?.tiktokUsername,
              pedidoId: pedido.id,
            });
          }
        }
      }
    });

    // Comprobante recibido (el bot procesó el comprobante con OCR)
    socketInstance.on("comprobante:recibido", (data: any) => {
      if (data.pedido && data.comprobante) {
        const pedido = data.pedido;
        const comprobante = data.comprobante;

        // Notificación especial de comprobante con botón para ver imagen
        agregarNotificacion({
          tipo: "comprobante",
          mensaje: `Comprobante de pago recibido de @${pedido.buyer?.tiktokUsername || "Cliente"} por ${formatoMoneda(comprobante.extractedAmount)}`,
          usuarioTiktok: pedido.buyer?.tiktokUsername,
          productoCode: pedido.orderItems?.[0]?.product?.code,
          productoNombre: pedido.orderItems?.[0]?.product?.name,
          monto: comprobante.extractedAmount,
          comprobanteUrl: comprobante.imageUrl,
          pedidoId: pedido.id,
        });
      }
    });

    // Reserva vencida: el backend la marcó CANCELLED porque el comprador
    // no confirmó en WhatsApp dentro del plazo.
    socketInstance.on(
      "reserva:cancelada",
      (data: {
        reservaId: number;
        tiktokUsername: string;
        productCode: string;
        productName: string;
        streamId: number;
      }) => {
        if (activeStream && data.streamId !== activeStream.id) return;
        handleReservaCancelada(data);
      }
    );

    return () => {
      socketInstance.off("chat:mensaje");
      socketInstance.off("nueva_intencion_compra");
      socketInstance.off("live:postulante");
      socketInstance.off("pedido:actualizado");
      socketInstance.off("pedido:nuevo");
      socketInstance.off("comprobante:recibido");
      socketInstance.off("reserva:cancelada");
      socketInstance.disconnect();
    };
  }, [token, agregarNotificacion, handleReservaCancelada]);

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

    // Sin WhatsApp conectado el bot no puede confirmar reservas ni pagos,
    // así que la transmisión no serviría de nada.
    if (botStatus !== "CONNECTED") {
      toast.error("Conecta tu ChatBot antes de iniciar una transmisión");
      router.push("/whatsapp");
      return;
    }

    if (!title.trim()) return toast.error("Ingresa un título para la transmisión");
    const cleanUsername = tiktokUsername.replace(/^@/, "").trim();
    if (!cleanUsername) return toast.error("Ingresa un usuario de TikTok");

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
    if (!activeStream) return;

    setIsLoading(true);
    const finishedStreamId = activeStream.id;

    try {
      // Este endpoint ya detiene la lectura de comentarios y cierra el stream
      // en el backend. No se llama aparte a /streams/:id/end porque ahí el
      // stream ya quedó finalizado y la operación respondería error.
      const response = await fetch(`${BACKEND_URL}/api/tiktok/detener`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`El backend respondió ${response.status}`);
      }

      activeUserRef.current = "";
      setIsConnected(false);
      setActiveStream(null);
      setTitle("");
      setTiktokUsername("");
      setShowEndModal(false);
      setProductosLive([]);
      limpiarNotificaciones();

      // El resumen necesita el id del live porque, al finalizarlo, ya no
      // existe ninguna transmision activa que consultar.
      router.push(`/live/summary?streamId=${finishedStreamId}`);
    } catch (error) {
      console.error("Error stopping stream:", error);
      toast.error("No se pudo finalizar la transmision");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidarPago = async (pedidoId: number) => {
    try {
      await apiClient.patch(`/orders/${pedidoId}/status`, { status: "PAID" });
    } catch (error) {
      console.error("Error al validar el pago:", error);
      toast.error("No se pudo validar el pago");
    }
  };

  const handleRechazarPago = async (pedidoId: number) => {
    try {
      await apiClient.patch(`/orders/${pedidoId}/status`, { status: "REJECTED" });
    } catch (error) {
      console.error("Error al rechazar el pago:", error);
      toast.error("No se pudo rechazar el pago");
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
              Reservas: <span className="font-bold text-brand-cyan">{productosLive.reduce((acc, p) => acc + p.reservados, 0)}</span>
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
            {!botConectado && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm font-medium text-amber-200">
                  Conecta tu WhatsApp para empezar
                </p>
                <p className="mt-1 text-xs text-amber-200/70">
                  El bot confirma las reservas y avisa a tus clientes cuando
                  validas un pago. Sin esa conexión no puedes transmitir.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/whatsapp")}
                  className="mt-2 text-xs font-semibold text-amber-300 underline underline-offset-4"
                >
                  Ir a ChatBot
                </button>
              </div>
            )}
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
                Usuario de TikTok *
              </label>
              <div className="flex items-stretch">
                <span className="flex items-center rounded-l-md border border-r-0 border-brand-primary/30 bg-brand-darkest px-3 text-sm text-slate-400">
                  @
                </span>
                <Input
                  type="text"
                  placeholder="mi_tienda_live"
                  value={tiktokUsername}
                  onChange={(e) =>
                    setTiktokUsername(e.target.value.replace(/^@/, ""))
                  }
                  className="rounded-l-none"
                />
              </div>
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Panel de información del stream */}
            <div className="order-1 lg:order-2 lg:col-span-1 flex flex-col gap-4 rounded-xl border border-brand-primary/20 bg-brand-dark p-4 sm:flex-row sm:items-center sm:justify-between">
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

            {/* Chat filtrado (compacto) - a la derecha del panel de información */}
            <div className="order-2 lg:order-1 lg:col-span-2">
              <div className="flex h-full flex-col rounded-xl border border-brand-primary/20 bg-brand-dark">
                <div className="flex items-center justify-between border-b border-brand-primary/10 p-3">
                  <span className="font-poppins text-xs font-semibold text-slate-100">
                    Chat Filtrado
                  </span>
                  <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-light">
                    {comments.length}
                  </span>
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto p-2">
                  {comments.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      Sin mensajes
                    </div>
                  ) : (
                    comments.slice(0, 20).map((msg, idx) => (
                      <div
                        key={`${msg.usuarioTiktok}-${msg.timestamp}-${idx}`}
                        className="rounded bg-brand-darkest/30 p-1.5"
                      >
                        <span className="font-poppins text-xs font-semibold text-brand-cyan">
                          @{msg.usuarioTiktok}
                        </span>
                        <span className="ml-1 text-xs text-slate-300">{msg.mensaje}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid h-[calc(80vh-10rem)] min-h-[600px] grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Panel izquierdo: Productos */}
            <div>
              <LiveProductsPanel productos={productosLive} onAddProduct={handleOpenProductModal} />
            </div>

            {/* Panel derecho: Notificaciones */}
            <div>
              <NotificationPanel
                notificaciones={notificaciones}
                onValidarPago={handleValidarPago}
                onRechazarPago={handleRechazarPago}
                token={token ?? undefined}
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
                filteredProducts.map((product) => (
                  <ProductPickerRow
                    key={product.code}
                    producto={product}
                    isAdded={productosLive.some((p) => p.code === product.code)}
                    isProcessing={processingProductCode === product.code}
                    onToggle={toggleProductInStream}
                  />
                ))
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
