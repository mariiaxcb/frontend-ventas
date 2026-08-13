export type EstadoPedido = "PENDIENTE" | "VALIDADO" | "RECHAZADO";

export interface Pedido {
  id: string;
  usuarioTiktok: string;
  codigoPedido: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  total: number;
  estado: EstadoPedido;
  comprobanteUrl?: string;
  ocrTexto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidarPedidoInput {
  pedidoId: string;
  estado: EstadoPedido;
  observacion?: string;
}
