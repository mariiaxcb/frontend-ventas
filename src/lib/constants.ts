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
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  IN_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
  DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/30',
  CANCELLED: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
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
  DASHBOARD: '/',
  LIVE: '/live',
  PRODUCTS: '/products',
  ORDERS: '/orders',
  REPORTS: '/reports',
  WHATSAPP: '/whatsapp',
} as const
