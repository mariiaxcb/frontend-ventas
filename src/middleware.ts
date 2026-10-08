import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_KEYS, ROUTES } from '@/lib/constants'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_KEYS.AUTH_TOKEN)?.value
  const { pathname } = request.nextUrl

  // Cualquier pantalla de acceso (login y recuperación) debe quedar
  // accesible sin token; y si ya hay sesión, no tiene sentido verlas.
  const esRutaDeAcceso =
    pathname.startsWith(ROUTES.LOGIN) ||
    pathname.startsWith(ROUTES.RECUPERAR_PASSWORD)

  if (!token && !esRutaDeAcceso) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (token && esRutaDeAcceso) {
    const dashboardUrl = new URL(ROUTES.DASHBOARD, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  /**
   * El matcher excluye los archivos estáticos que el navegador pide por su
   * cuenta. `icon.svg` y `favicon.ico` tienen que estar aquí: si no, el
   * middleware los trata como rutas protegidas y responde con un 307 al login
   * en vez de con la imagen, y el navegador termina mostrando la página de
   * inicio de sesión como si fuera el icono.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)',
  ],
}
