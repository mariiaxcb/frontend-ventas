export interface ProductoLive {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  reservados: number;
  vendidos: number;
}

export interface NotificacionLive {
  id: string;
  tipo:
    | "reserva"
    | "confirmacion"
    | "comprobante"
    | "timeout_tiktok"
    | "timeout_wpp"
    | "producto_agotado"
    | "producto_vendido";
  mensaje: string;
  timestamp: string;
  usuarioTiktok?: string;
  productoCode?: string;
  productoNombre?: string;
  monto?: number;
  comprobanteUrl?: string;
  pedidoId?: number;
}

export interface ComprobanteData {
  id: number;
  imageUrl: string;
  extractedAmount: number;
  validationStatus: string;
  orderId: number;
}
