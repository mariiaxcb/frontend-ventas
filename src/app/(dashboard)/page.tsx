import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

/** El panel abre directamente en Productos. */
export default function RootPage() {
  redirect(ROUTES.PRODUCTS)
}