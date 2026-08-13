export const ESTADOS_PEDIDO = {
  PENDIENTE: "PENDIENTE",
  VALIDADO: "VALIDADO",
  RECHAZADO: "RECHAZADO",
} as const;

export const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  VALIDADO: "Validado",
  RECHAZADO: "Rechazado",
};

export const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "bg-estado-pendiente/10 text-estado-pendiente border-estado-pendiente/30",
  VALIDADO: "bg-estado-validado/10 text-estado-validado border-estado-validado/30",
  RECHAZADO: "bg-estado-rechazado/10 text-estado-rechazado border-estado-rechazado/30",
};

export const APP_NAME = "TikTok Live Sales Manager";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  LIVE: "/live",
  PRODUCTOS: "/productos",
  PEDIDOS: "/pedidos",
  REPORTES: "/reportes",
};
