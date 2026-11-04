'use client'

import { useEffect, useState } from 'react'
import { Save, Pencil, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/services/api.client'

interface Perfil {
  id: number
  username: string
  email: string
  status: string
  tiktokUsername: string | null
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  // Valor que se esta editando. Si el usuario ya tiene uno definido, arranca
  // bloqueado y se habilita al pulsar "Editar".
  const [valor, setValor] = useState('')
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        const res = await apiClient.get('/auth/profile')
        if (cancelado) return
        const data = res.data?.data ?? res.data
        setPerfil(data)
        setValor(data?.tiktokUsername ?? '')
        // Si no hay username definido, arrancamos en modo edicion.
        setEditando(!data?.tiktokUsername)
      } catch (err: any) {
        if (cancelado) return
        setError(
          err?.response?.data?.mensaje ||
            err?.response?.data?.message ||
            'No se pudo cargar el perfil.',
        )
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [])

  async function guardar() {
    setError(null)
    setExito(null)
    const limpio = valor.trim().replace(/^@/, '')
    if (limpio.length === 0) {
      setError('Ingresa un usuario de TikTok.')
      return
    }
    if (limpio.length < 2 || limpio.length > 24) {
      setError('El usuario debe tener entre 2 y 24 caracteres.')
      return
    }
    if (!/^[A-Za-z0-9._]+$/.test(limpio)) {
      setError('Solo letras, numeros, punto y guion bajo.')
      return
    }

    setGuardando(true)
    try {
      const res = await apiClient.put('/auth/profile', { tiktokUsername: limpio })
      const data = res.data?.data ?? res.data
      setPerfil(data)
      setValor(data?.tiktokUsername ?? limpio)
      setEditando(false)
      setExito('Usuario de TikTok guardado correctamente.')
    } catch (err: any) {
      setError(
        err?.response?.data?.mensaje ||
          err?.response?.data?.message ||
          'No se pudo guardar el usuario.',
      )
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        Cargando perfil...
      </div>
    )
  }

  const definido = Boolean(perfil?.tiktokUsername)

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
          Perfil
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Define el usuario de TikTok con el que realizas tus transmisiones en
          vivo. Se usara automaticamente al iniciar un live.
        </p>
      </div>

      <div className="mx-auto max-w-xl rounded-xl border border-surface-border bg-brand-dark p-6 shadow-lg">
        <div className="mb-4">
          <p className="text-xs font-medium text-slate-400">Cuenta</p>
          <p className="text-sm font-semibold text-slate-100">
            {perfil?.email ?? ''}
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-300">
            Usuario de TikTok donde realizas el live
          </label>
          <div className="flex items-stretch">
            <span className="flex items-center rounded-l-md border border-r-0 border-surface-border bg-brand-darkest px-3 text-sm text-slate-400">
              @
            </span>
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value.replace(/^@/, ''))}
              disabled={!editando}
              placeholder="mi_tienda_live"
              className="w-full rounded-l-none rounded-r-md border border-surface-border bg-brand-raised px-3 py-2.5 font-inter text-sm text-slate-100 transition-all placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-60"
            />
          </div>
          <p className="text-xs text-slate-500">
            No incluyas el arroba. Solo letras, numeros, punto y guion bajo.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-estado-rechazado/40 bg-estado-rechazado/10 px-3 py-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-estado-rechazado" />
              <p className="text-sm font-inter text-estado-rechazado">{error}</p>
            </div>
          )}

          {exito && (
            <div className="flex items-start gap-2 rounded-md border border-estado-validado/40 bg-estado-validado/10 px-3 py-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-estado-validado" />
              <p className="text-sm font-inter text-estado-validado">{exito}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            {!definido || editando ? (
              <Button type="button" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditando(true)
                  setExito(null)
                }}
              >
                <Pencil size={14} className="mr-1.5" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
