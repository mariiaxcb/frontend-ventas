'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import Cookies from 'js-cookie'
import { COOKIE_KEYS, ROUTES } from '@/lib/constants'
import type { User, AuthContextValue } from '@/types/auth.types'
import { useRouter } from 'next/navigation'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = Cookies.get(COOKIE_KEYS.AUTH_TOKEN)
    const storedUser = Cookies.get(COOKIE_KEYS.AUTH_USER)

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        Cookies.remove(COOKIE_KEYS.AUTH_TOKEN)
        Cookies.remove(COOKIE_KEYS.AUTH_USER)
      }
    }
    setIsLoading(false)
  }, [])

  function login(newToken: string, newUser: User) {
    Cookies.set(COOKIE_KEYS.AUTH_TOKEN, newToken, {
      expires: 7,
      sameSite: 'lax',
    })
    Cookies.set(COOKIE_KEYS.AUTH_USER, JSON.stringify(newUser), {
      expires: 7,
      sameSite: 'lax',
    })
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    Cookies.remove(COOKIE_KEYS.AUTH_TOKEN)
    Cookies.remove(COOKIE_KEYS.AUTH_USER)
    setToken(null)
    setUser(null)
    router.push(ROUTES.LOGIN)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
