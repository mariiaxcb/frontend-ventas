'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'
import { apiClient } from '@/services/api.client'

const schema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('El correo no es valido'),
})

type FormValues = z.infer<typeof schema>

export default function RecuperarPasswordPage() {
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [correo, setCorreo] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setEnviando(true)
    setError(null)
    setCorreo(values.email)
    try {
      await apiClient.post('/auth/forgot-password', { email: values.email })
      setEnviado(true)
    } catch {
      // Respuesta generica para no dar pistas de si el correo existe.
      setEnviado(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-darkest px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-lg border border-surface-border bg-brand-dark p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
          Recuperar contrasena
        </h1>
        <p className="mb-6 text-sm font-inter text-slate-400">
          Ingresa tu correo electronico y te enviaremos un enlace para establecer
          una nueva contrasena.
        </p>

        {enviado ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-estado-validado/40 bg-estado-validado/10 px-4 py-6 text-center">
            <MailCheck size={36} className="text-estado-validado" />
            <div>
              <p className="font-poppins text-sm font-semibold text-estado-validado">
                Correo enviado
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Si el correo existe, se envio un enlace de recuperacion a{' '}
                <span className="font-medium text-slate-200">{correo}</span>.
                Revisa tu bandeja de entrada.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setEnviado(false)}
              className="mt-1"
            >
              Usar otro correo
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Input
              type="email"
              placeholder="Correo electronico"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            {error && (
              <p className="text-sm text-estado-rechazado">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={enviando}
            >
              {enviando ? 'Enviando...' : 'Enviar'}
            </Button>
          </form>
        )}

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
