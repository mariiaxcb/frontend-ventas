"use client";

import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { FilteredComment, Product, ActiveStream } from "@/types/live";
import { ChatMensajeEvento } from "@/types/socket";
import { ProductosEnOferta } from "@/components/live/OfertsProducts";
import { ChatStream } from "@/components/live/ChatStream";
import { ListaPostulantes } from "@/components/live/ListaPostulantes";

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
  const [streamProducts, setStreamProducts] = useState<Product[]>([]);

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
          products: [],
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
          Authorization: `Bearer ${token}`,
        },
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

  const handlePostular = (mensaje: ChatMensajeEvento) => {
    console.log("Postulando usuario:", mensaje);
    // Agrega la lógica para enviar la postulación al backend o actualizar el estado de postulantes
  };

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
              {/* COMPONENTE: Productos en oferta */}
              <ProductosEnOferta
                streamProducts={streamProducts}
                activeStreamId={activeStream.id}
                token={token}
                backendUrl={BACKEND_URL}
                onStreamProductsChange={setStreamProducts}
              />

              {/* COMPONENTE: Chat filtrado de la transmisión */}
              <ChatStream
                comentarios={comments}
              />
            </div>

            {/* COMPONENTE: Compradores con reservación */}
            <ListaPostulantes
              streamId={activeStream.id}
              onVentaConfirmada={() => setDbSalesCount((prev) => prev + 1)}
            />
          </div>
        </>
      )}

      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">¿Finalizar Transmisión?</h3>
            <p className="text-xs text-slate-300">
              Estás a punto de finalizar el monitoreo en vivo de{" "}
              <span className="font-semibold text-brand-cyan">@{activeStream?.tiktokUsername}</span>. Esta acción detendrá la lectura de comentarios.
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