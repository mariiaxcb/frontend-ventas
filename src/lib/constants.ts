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
} as const
