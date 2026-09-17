import type { Pedido } from "./pedido";

export interface ChatMensajeEvento {
  usuarioTiktok: string;
  mensaje: string;
  timestamp: string;
}

export interface PostulanteEvento {
  usuarioTiktok: string;
  nickname?: string;
  productoId: string;
  productoNombre?: string;
  comentario?: string;
  timestamp: string;
  reservados?: number;
  limite?: number;
  stock?: number;
}

export interface PedidoActualizadoEvento {
  pedido: Pedido;
}

export interface ServerToClientEvents {
  "chat:mensaje": (data: ChatMensajeEvento) => void;
  "live:postulante": (data: PostulanteEvento) => void;
  "pedido:actualizado": (data: PedidoActualizadoEvento) => void;
  "pedido:nuevo": (data: PedidoActualizadoEvento) => void;
}

export interface ClientToServerEvents {
  "live:unirse": (liveId: string) => void;
  "live:salir": (liveId: string) => void;
}
