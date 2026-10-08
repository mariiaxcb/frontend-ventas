import axios from 'axios'
import Cookies from 'js-cookie'
import { COOKIE_KEYS, ROUTES } from '@/lib/constants'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get(COOKIE_KEYS.AUTH_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Rutas donde un 401 NO debe disparar la redirección.
 *
 * El login responde 401 cuando las credenciales son incorrectas, que es el
 * caso normal de un error de validación, no una sesión caducada. Sin esta
 * excepción el interceptor limpiaba las cookies y recargaba la página con
 * `window.location.href`, y el mensaje de error desaparecía al instante.
 */
const RUTAS_SIN_REDIRECTO = [ROUTES.LOGIN, ROUTES.RECUPERAR_PASSWORD]

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const esRutaDeAcceso = RUTAS_SIN_REDIRECTO.some((ruta) =>
      (error.config?.url ?? '').includes(ruta),
    )

    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !esRutaDeAcceso
    ) {
      Cookies.remove(COOKIE_KEYS.AUTH_TOKEN)
      Cookies.remove(COOKIE_KEYS.AUTH_USER)
      window.location.href = ROUTES.LOGIN
    }

    return Promise.reject(error)
  },
)
