export const ORDER_STATUS = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  PAID: 'Paid',
  REJECTED: 'Rejected',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const APP_NAME = 'TikTok Live Sales Manager'

export const ESTADO_COLORS: Record<string, string> = {
  PENDING: 'bg-estado-pendiente/10 text-estado-pendiente border-estado-pendiente/30',
  IN_REVIEW: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  PAID: 'bg-estado-validado/10 text-estado-validado border-estado-validado/30',
  REJECTED: 'bg-estado-rechazado/10 text-estado-rechazado border-estado-rechazado/30',
  DELIVERED: 'bg-brand-primary/15 text-brand-light border-brand-primary/30',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
}

export const ESTADO_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  PAID: 'Pagado',
  REJECTED: 'Rechazado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export const COOKIE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
} as const

export const ROUTES = {
  LOGIN: '/login',
  /** Raíz del panel: entra directamente a Productos. */
  DASHBOARD: '/products',
  LIVE: '/live',
  LIVE_TRANSITION: '/live/transition-live',
  LIVE_SUMMARY: '/live/summary',
  PRODUCTS: '/products',
  ORDERS: '/orders',
  REPORTS: '/reports',
  WHATSAPP: '/whatsapp',
} as const
