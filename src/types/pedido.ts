/**
 * Estados reales del pedido según el enum OrderStatus del backend.
 * No agregar variantes: el panel y el bot dependen de estos valores.
 */
export type EstadoPedido =
  | "PENDING"
  | "IN_REVIEW"
  | "PAID"
  | "REJECTED"
  | "DELIVERED"
  | "CANCELLED";

export type EstadoComprobante = "PENDING" | "VALIDATED" | "REJECTED";

export interface PedidoProducto {
  id: number;
  code: string;
  name: string;
  imageUrl?: string | null;
}

export interface PedidoItem {
  id: number;
  quantity: number;
  unitPrice: string | number;
  productId: number;
  product: PedidoProducto;
}

export interface PedidoBuyer {
  id: number;
  clientName: string;
  whatsapp: string;
  tiktokUsername?: string | null;
}

export interface PedidoComprobante {
  id: number;
  imageUrl: string;
  extractedAmount?: string | number | null;
  validationStatus: EstadoComprobante;
}

/** Pedido tal como lo devuelve GET /api/orders */
export interface Pedido {
  id: number;
  status: EstadoPedido;
  totalPrice: string | number;
  qrId?: string | null;
  transactionId?: string | null;
  createdAt: string;
  buyerId: number;
  streamId: number;
  buyer: PedidoBuyer;
  orderItems: PedidoItem[];
  receipt?: PedidoComprobante | null;
  stream?: { id: number; title: string; status: string } | null;
}

/** Texto legible de cada estado. */
export const ESTADO_PEDIDO_LABELS: Record<EstadoPedido, string> = {
  PENDING: "Pendiente de pago",
  IN_REVIEW: "Comprobante en revisión",
  PAID: "Pagado",
  REJECTED: "Rechazado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

/** Descripción corta para tooltips. */
export const ESTADO_PEDIDO_HINTS: Record<EstadoPedido, string> = {
  PENDING: "El comprador todavía no ha enviado el comprobante",
  IN_REVIEW: "El comprobante fue recibido y espera tu validación",
  PAID: "Pago verificado por el vendedor",
  REJECTED: "El pago no fue aceptado",
  DELIVERED: "Producto entregado al comprador",
  CANCELLED: "La reserva se canceló por falta de pago",
};

/** El vendedor solo puede actuar sobre estos estados. */
export const ESTADOS_VALIDABLES: EstadoPedido[] = ["IN_REVIEW"];