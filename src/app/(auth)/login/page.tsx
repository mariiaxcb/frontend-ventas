'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/services/api.client'
import { ROUTES } from '@/lib/constants'

const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
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
        setError('Credenciales inválidas.')
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
      <div className="w-full max-w-sm rounded-lg border border-brand-primary/20 bg-brand-dark p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
          Sistema de Ventas
        </h1>
        <p className="mb-6 text-sm font-inter text-slate-400">
          Inicie sesión con su nombre de usuario y contraseña para acceder al
          sistema.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="text"
            placeholder="Nombre de usuario"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            error={errors.password?.message}
            {...register('password')}
          />
          {error && <p className="text-sm font-inter text-red-400">{error}</p>}
          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión…' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
