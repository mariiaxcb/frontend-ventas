'use client'

import { useEffect, useState } from 'react'
import {
  Save,
  Pencil,
  CheckCircle2,
  AlertCircle,
  AtSign,
  Loader2,
  X,
} from 'lucide-react'
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
  const [errorTikTok, setErrorTikTok] = useState<string | null>(null)
  const [exitoTikTok, setExitoTikTok] = useState<string | null>(null)

  // Estado TikTok
  const [tiktokValor, setTiktokValor] = useState('')
  const [editandoTiktok, setEditandoTiktok] = useState(false)
  const [guardandoTiktok, setGuardandoTiktok] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        const res = await apiClient.get('/auth/profile')
        if (cancelado) return
        const data = res.data?.data ?? res.data
        setPerfil(data)
        setTiktokValor(data?.tiktokUsername ?? '')
        setEditandoTiktok(!data?.tiktokUsername)
      } catch (err: any) {
        if (cancelado) return
        setErrorTikTok(
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

  async function guardarTiktok() {
    setErrorTikTok(null)
    setExitoTikTok(null)
    const limpio = tiktokValor.trim().replace(/^@/, '')
    if (limpio.length === 0) {
      setErrorTikTok('Ingresa un usuario de TikTok.')
      return
    }
    if (limpio.length < 2 || limpio.length > 24) {
      setErrorTikTok('El usuario debe tener entre 2 y 24 caracteres.')
      return
    }
    if (!/^[A-Za-z0-9._]+$/.test(limpio)) {
      setErrorTikTok('Solo letras, números, punto y guión bajo.')
      return
    }

    setGuardandoTiktok(true)
    try {
      const res = await apiClient.put('/auth/profile', { tiktokUsername: limpio })
      const data = res.data?.data ?? res.data
      setPerfil(data)
      setTiktokValor(data?.tiktokUsername ?? limpio)
      setEditandoTiktok(false)
      setExitoTikTok('Usuario de TikTok guardado correctamente.')
    } catch (err: any) {
      setErrorTikTok(
        err?.response?.data?.mensaje ||
          err?.response?.data?.message ||
          'No se pudo guardar el usuario de TikTok.',
      )
    } finally {
      setGuardandoTiktok(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-slate-400">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Cargando perfil...
      </div>
    )
  }

  const definidoTiktok = Boolean(perfil?.tiktokUsername)

  return (
    <div className="w-full space-y-6">
      {/* Título Centrado */}
      <div className="text-center py-2">
        <h1 className="font-poppins text-2xl sm:text-3xl font-bold tracking-wide text-brand-cyan">
          Configuración de Perfil
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Gestiona tu cuenta de TikTok Live.
        </p>
      </div>

      {/* Tarjeta Única de TikTok (Centrada y con ancho máximo) */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="rounded-xl border border-surface-border bg-brand-dark p-6 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-surface-border pb-3 mb-4">
              <AtSign className="text-brand-cyan" size={20} />
              <h2 className="text-base font-semibold text-slate-100">Cuenta de TikTok Live</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Usuario de TikTok asignado a las transmisiones
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <AtSign size={16} />
                </span>
                <input
                  type="text"
                  value={tiktokValor}
                  onChange={(e) => setTiktokValor(e.target.value.replace(/^@/, ''))}
                  disabled={!editandoTiktok}
                  placeholder="mi_tienda_live"
                  className="w-full rounded-md border border-surface-border bg-brand-raised pl-9 pr-3 py-2.5 font-inter text-sm text-slate-100 transition-all placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-60"
                />
              </div>
              <p className="text-xs text-slate-500">
                Sin arroba (@). Ejemplo: <span className="text-slate-400">mitienda.bo</span>
              </p>

              {errorTikTok && (
                <div className="flex items-start gap-2 rounded-md border border-estado-rechazado/40 bg-estado-rechazado/10 px-3 py-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-estado-rechazado" />
                  <p className="text-xs text-estado-rechazado">{errorTikTok}</p>
                </div>
              )}

              {exitoTikTok && (
                <div className="flex items-start gap-2 rounded-md border border-estado-validado/40 bg-estado-validado/10 px-3 py-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-estado-validado" />
                  <p className="text-xs text-estado-validado">{exitoTikTok}</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end pt-3 border-t border-surface-border/60">
            {!definidoTiktok || editandoTiktok ? (
              <div className="flex gap-2">
                {definidoTiktok && (
                  <div className="relative group">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditandoTiktok(false)
                        setTiktokValor(perfil?.tiktokUsername ?? '')
                        setErrorTikTok(null)
                      }}
                      className="h-9 w-9 p-0 flex items-center justify-center"
                    >
                      <X size={18} />
                    </Button>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface-border text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
                      Cancelar
                    </span>
                  </div>
                )}

                <div className="relative group">
                  <Button
                    type="button"
                    size="sm"
                    onClick={guardarTiktok}
                    disabled={guardandoTiktok}
                    className="h-9 w-9 p-0 flex items-center justify-center"
                  >
                    {guardandoTiktok ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                  </Button>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface-border text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
                    Guardar TikTok
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditandoTiktok(true)
                    setExitoTikTok(null)
                  }}
                  className="h-9 w-9 p-0 flex items-center justify-center"
                >
                  <Pencil size={18} />
                </Button>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface-border text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
                  Editar usuario
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}