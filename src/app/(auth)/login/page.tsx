'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/services/api.client'
import { ROUTES } from '@/lib/constants'

const loginSchema = z.object({
  username: z.string().min(1, 'El correo electrónico es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginForm) {
    setError(null)
    try {
      const response = await apiClient.post('/auth/login', {
        username: values.username,
        password: values.password,
      })

      const { token, user } = response.data.data
      login(token, user)
      router.push(ROUTES.DASHBOARD)
    } catch (err: any) {
      if (!err.response) {
        setError(
          'Error de conexión. Asegúrate de que el servidor esté encendido.',
        )
      } else if (err.response.status === 401 || err.response.status === 400) {
        setError('Correo electrónico o contraseña incorrectos.')
      } else {
        setError(
          err.response.data?.message ||
            err.response.data?.mensaje ||
            'Ocurrió un error al intentar iniciar sesión.',
        )
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-darkest px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-lg border border-surface-border bg-brand-dark p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
          TikTok Live Sales
        </h1>
        <p className="mb-6 text-sm font-inter text-slate-400">
          Inicie sesión con su correo electrónico y contraseña para acceder al
          sistema.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/*
            `type="text"` y no `type="email"` a propósito: la validación
            nativa del navegador bloquea el envío si el valor no parece un
            correo (por ejemplo "Admin"), y el backend autentica por nombre de
            usuario. `inputMode="email"` mantiene el teclado de correo en el
            móvil sin imponer el formato.
          */}
          <Input
            type="text"
            inputMode="email"
            placeholder="Correo electrónico"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-estado-rechazado/40 bg-estado-rechazado/10 px-3 py-2"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-estado-rechazado"
              />
              <p className="text-sm font-inter text-estado-rechazado">
                {error}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión…' : 'Ingresar'}
          </Button>
        </form>

        <div className="mt-6 border-t border-surface-border pt-4 text-center">
          <Link
            href={ROUTES.RECUPERAR_PASSWORD}
            className="text-sm text-slate-400 transition-colors hover:text-brand-cyan"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  )
}