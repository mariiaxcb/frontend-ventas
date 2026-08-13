"use client";

import { useEffect } from "react";
import { useSocketContext } from "@/context/SocketContext";
import type {
  ChatMensajeEvento,
  PostulanteEvento,
  PedidoActualizadoEvento,
} from "@/types/socket";

interface UseSocketHandlers {
  onChatMensaje?: (data: ChatMensajeEvento) => void;
  onPostulante?: (data: PostulanteEvento) => void;
  onPedidoActualizado?: (data: PedidoActualizadoEvento) => void;
  onPedidoNuevo?: (data: PedidoActualizadoEvento) => void;
}

export function useSocket(handlers: UseSocketHandlers) {
  const { socket, conectado } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    if (handlers.onChatMensaje) {
      socket.on("chat:mensaje", handlers.onChatMensaje);
    }
    if (handlers.onPostulante) {
      socket.on("live:postulante", handlers.onPostulante);
    }
    if (handlers.onPedidoActualizado) {
      socket.on("pedido:actualizado", handlers.onPedidoActualizado);
    }
    if (handlers.onPedidoNuevo) {
      socket.on("pedido:nuevo", handlers.onPedidoNuevo);
    }

    return () => {
      socket.off("chat:mensaje", handlers.onChatMensaje);
      socket.off("live:postulante", handlers.onPostulante);
      socket.off("pedido:actualizado", handlers.onPedidoActualizado);
      socket.off("pedido:nuevo", handlers.onPedidoNuevo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return { conectado };
}
