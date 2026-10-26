'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'
import { apiClient } from '@/services/api.client'

const resetPasswordSchema = z
  .object({
    nueva: z
      .string()
      .min(8, 'La contrasena debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir una mayuscula')
      .regex(/[a-z]/, 'Debe incluir una minuscula')
      .regex(/[0-9]/, 'Debe incluir un numero')
      .regex(/[^A-Za-z0-9]/, 'Debe incluir un caracter especial'),
    confirmar: z.string().min(1, 'Confirma tu contrasena'),
  })
  .refine((data) => data.nueva === data.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

type FormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const [exito, setExito] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(resetPasswordSchema) })

  const nuevaActual = watch('nueva') ?? ''
  const confirmarActual = watch('confirmar') ?? ''
  const coinciden =
    confirmarActual.length > 0 && nuevaActual === confirmarActual

  // Validaciones en tiempo real, una por una, para que el usuario vea que falta.
  const reglas = [
    { ok: nuevaActual.length >= 8, texto: 'Al menos 8 caracteres' },
    { ok: /[A-Z]/.test(nuevaActual), texto: 'Una mayuscula' },
    { ok: /[a-z]/.test(nuevaActual), texto: 'Una minuscula' },
    { ok: /[0-9]/.test(nuevaActual), texto: 'Un numero' },
    { ok: /[^A-Za-z0-9]/.test(nuevaActual), texto: 'Un caracter especial' },
  ]

  async function onSubmit(values: FormValues) {
    setErrorServidor(null)
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setErrorServidor('El enlace no es valido.')
      return
    }

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: values.nueva,
      })
      setExito(true)
    } catch (err: any) {
      const mensaje =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        'No se pudo cambiar la contrasena. Verifica que el enlace no haya expirado.'
      setErrorServidor(mensaje)
    }
  }

  if (exito) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-estado-validado/40 bg-estado-validado/10 px-4 py-6 text-center">
        <CheckCircle2 size={40} className="text-estado-validado" />
        <div>
          <p className="font-poppins text-sm font-semibold text-estado-validado">
            Contrasena actualizada
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Tu contrasena se cambio correctamente. Ya puedes iniciar sesion.
          </p>
        </div>
        <Link
          href={ROUTES.LOGIN}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-4 py-2 text-sm font-poppins font-bold text-slate-100 transition hover:bg-brand-light"
        >
          Ir al inicio de sesion
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-inter text-slate-400">
          Nueva contrasena
        </label>
        <Input
          type="password"
          placeholder="Nueva contrasena"
          autoComplete="new-password"
          error={errors.nueva?.message}
          {...register('nueva')}
        />
      </div>

      {nuevaActual.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs">
          {reglas.map((regla) => (
            <li
              key={regla.texto}
              className={
                regla.ok
                  ? 'text-estado-validado'
                  : 'text-slate-500'
              }
            >
              {regla.ok ? 'OK' : '--'} {regla.texto}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-inter text-slate-400">
          Repita su contrasena
        </label>
        <Input
          type="password"
          placeholder="Repita su contrasena"
          autoComplete="new-password"
          error={errors.confirmar?.message}
          {...register('confirmar')}
        />
      </div>

      {confirmarActual.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs">
          <li
            className={
              coinciden
                ? 'text-estado-validado'
                : 'text-estado-rechazado'
            }
          >
            {coinciden ? 'OK' : '--'} Las contraseñas coinciden
          </li>
        </ul>
      )}

      {errorServidor && (
        <p className="text-sm text-estado-rechazado">{errorServidor}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Cambiando...' : 'Cambiar contrasena'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-darkest px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-lg border border-surface-border bg-brand-dark p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
          Nueva contrasena
        </h1>
        <p className="mb-6 text-sm font-inter text-slate-400">
          Ingresa y confirma tu nueva contrasena para restablecer el acceso.
        </p>

        <Suspense fallback={<p className="text-sm text-slate-400">Cargando...</p>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-6 border-t border-surface-border pt-4 text-center">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-brand-cyan"
          >
            <ArrowLeft size={14} />
            Volver al inicio de sesion
          </Link>
        </div>
      </div>
    </div>
  )
}
