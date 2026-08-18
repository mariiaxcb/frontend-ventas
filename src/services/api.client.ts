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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove(COOKIE_KEYS.AUTH_TOKEN)
      Cookies.remove(COOKIE_KEYS.AUTH_USER)
      window.location.href = ROUTES.LOGIN
    }
    return Promise.reject(error)
  },
)
