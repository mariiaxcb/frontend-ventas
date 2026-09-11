"use client";

import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { ChatStream } from "@/components/live/ChatStream";
import { ListaPostulantes } from "@/components/live/ListaPostulantes";

export interface ComentarioFiltrado {
  usuario: string;
  nickname: string;
  fotoPerfil: string;
  comentario: string;
  fecha: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function LivePage() {
  const [ventasEnBD, setVentasEnBD] = useState<number>(0);
  const [tiktokUsername, setTiktokUsername] = useState<string>("");
  const [palabrasClave, setPalabrasClave] = useState<string>("mio, precio, quiero, comprar");
  const [conectado, setConectado] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [comentarios, setComentarios] = useState<ComentarioFiltrado[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const activeUserRef = useRef<string>("");

  useEffect(() => {
    // Conexión única del cliente Socket
    const socketInstance: Socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("✅ Socket.io conectado ID:", socketInstance.id);
      
      // Re-unirse a la sala si se reconecta la conexión
      if (activeUserRef.current) {
        socketInstance.emit("join_room", `live:${activeUserRef.current}`);
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket.io desconectado");
      setConectado(false);
    });

    // Escuchar la llegada de comentarios con filtro deduplicador
    socketInstance.on("nueva_intencion_compra", (nuevoComentario: ComentarioFiltrado) => {
      console.log("🎯 Comentario capturado en el Frontend:", nuevoComentario);

      setComentarios((prev) => {
        const yaExiste = prev.some(
          (c) =>
            c.usuario === nuevoComentario.usuario &&
            c.comentario === nuevoComentario.comentario &&
            c.fecha === nuevoComentario.fecha
        );

        if (yaExiste) {
          console.warn("⚠️ Comentario duplicado omitido en Frontend.");
          return prev;
        }

        return [nuevoComentario, ...prev];
      });
    });

    return () => {
      socketInstance.off("nueva_intencion_compra");
      socketInstance.disconnect();
    };
  }, []);

  const handleIniciarMonitoreo = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = tiktokUsername.replace(/^@/, "").trim();
    if (!cleanUsername) return alert("Ingresa un usuario de TikTok");

    setCargando(true);

    const listaPalabras = palabrasClave
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      const response = await fetch(`${BACKEND_URL}/api/tiktok/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tiktokUsername: cleanUsername,
          palabrasClave: listaPalabras,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        activeUserRef.current = cleanUsername;
        setComentarios([]); // Limpiar la lista previa

        if (socketRef.current) {
          socketRef.current.emit("join_room", `live:${cleanUsername}`);
        }
        setConectado(true);
      } else {
        alert(`Error: ${data.error || "No se pudo conectar al Live"}`);
      }
    } catch (error) {
      console.error("Error al conectar:", error);
      alert("Error de conexión con el servidor backend");
    } finally {
      setCargando(false);
    }
  };

  const handleDetenerMonitoreo = async () => {
    setCargando(true);
    try {
      await fetch(`${BACKEND_URL}/api/tiktok/detener`, { method: "POST" });
      activeUserRef.current = "";
      setConectado(false);
    } catch (error) {
      console.error("Error al detener:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
            Monitor en tiempo real de TikTok Live
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Captura de comentarios en memoria RAM y confirmación manual de pedidos a la BD.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  conectado ? "bg-emerald-400" : "bg-amber-400"
                } opacity-75`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  conectado ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            <span className="text-slate-300 font-medium">
              {conectado ? "En vivo" : "Desconectado"}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            En cola (RAM): <span className="font-bold text-brand-cyan">{comentarios.length}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            Ventas (BD): <span className="font-bold text-emerald-400">{ventasEnBD}</span>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleIniciarMonitoreo}
        className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="flex-1 w-full">
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Usuario de TikTok (sin @)
          </label>
          <input
            type="text"
            placeholder="ej. mi_tienda_live"
            value={tiktokUsername}
            onChange={(e) => setTiktokUsername(e.target.value)}
            disabled={conectado}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan disabled:opacity-50"
          />
        </div>

        <div className="flex-[2] w-full">
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Filtro de palabras clave (separadas por coma)
          </label>
          <input
            type="text"
            placeholder="mio, precio, quiero"
            value={palabrasClave}
            onChange={(e) => setPalabrasClave(e.target.value)}
            disabled={conectado}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-cyan disabled:opacity-50"
          />
        </div>

        {conectado ? (
          <button
            type="button"
            onClick={handleDetenerMonitoreo}
            disabled={cargando}
            className="w-full md:w-auto px-5 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-60"
          >
            {cargando ? "Deteniendo..." : "🛑 Detener Lectura"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={cargando}
            className="w-full md:w-auto px-5 py-2 rounded-lg text-xs font-semibold text-white bg-brand-cyan hover:bg-cyan-600 transition-all cursor-pointer disabled:opacity-60"
          >
            {cargando ? "Conectando..." : "▶️ Iniciar Lectura"}
          </button>
        )}
      </form>

      <div className="grid h-[calc(80vh-10rem)] grid-cols-1 gap-6 lg:grid-cols-2">
        <ChatStream comentarios={comentarios} />
        <ListaPostulantes onVentaConfirmada={() => setVentasEnBD((prev) => prev + 1)} />
      </div>
    </div>
  );
}