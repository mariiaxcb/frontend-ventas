'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'

/**
 * Recuperación de contraseña.
 *
 * Pantalla visual, sin llamada al backend: el objetivo es revisar el copy y el
 * flujo. Cuando exista el endpoint, basta con reemplazar el onSubmit por la
 * petición y desmarcar `enviado` cuando la API confirme.
 */
export default function RecuperarPasswordPage() {
  const [correo, setCorreo] = useState('')
  const [enviado, setEnviado] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-darkest px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-lg border border-surface-border bg-brand-dark p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
          Recuperar contraseña
        </h1>
        <p className="mb-6 text-sm font-inter text-slate-400">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          establecer una nueva contraseña.
        </p>

        {enviado ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-estado-validado/40 bg-estado-validado/10 px-4 py-6 text-center">
            <MailCheck size={36} className="text-estado-validado" />
            <div>
              <p className="font-poppins text-sm font-semibold text-estado-validado">
                Correo enviado
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Revisa la bandeja de entrada de{' '}
                <span className="font-medium text-slate-200">{correo}</span> para
                continuar con la recuperación.
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
            onSubmit={(event) => {
              event.preventDefault()
              setEnviado(true)
            }}
            className="space-y-4"
          >
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Enviar
            </Button>
          </form>
        )}

        <div className="mt-6 border-t border-surface-border pt-4 text-center">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-brand-cyan"
          >
            <ArrowLeft size={14} />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}