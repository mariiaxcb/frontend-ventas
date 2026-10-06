'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Transmision {
  id: string
  tiktokUsername: string
  fechaInicio: string
  fechaFin?: string
  totalComentarios: number
  totalVentas: number
  estado: 'ACTIVA' | 'FINALIZADA'
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

export default function HistorialLivePage() {
  const [transmisiones, setTransmisiones] = useState<Transmision[]>([])
  const [cargando, setCargando] = useState<boolean>(true)

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/tiktok/historial`)
        if (res.ok) {
          const data = await res.json()
          setTransmisiones(data)
        }
      } catch (error) {
        console.error('Error al obtener historial:', error)
      } finally {
        setCargando(false)
      }
    }

    fetchHistorial()
  }, [])

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
            Historial de Transmisiones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Consulta el registro de directos monitoreados y sus métricas de
            venta.
          </p>
        </div>

        <Link
          href="/live/transition-live"
          className="px-4 py-2 text-xs font-semibold text-slate-100 bg-brand-cyan hover:bg-emerald-400 rounded-lg transition-all text-center"
        >
          ➕ Nueva Transmisión
        </Link>
      </div>

      {/* Listado / Tabla */}
      {cargando ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          Cargando historial...
        </div>
      ) : transmisiones.length === 0 ? (
        <div className="bg-brand-raised border border-surface-border rounded-xl p-8 text-center text-slate-400 text-sm">
          No hay transmisiones registradas aún.
        </div>
      ) : (
        <div className="bg-brand-raised border border-surface-border rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-brand-dark text-slate-400 font-medium uppercase border-b border-surface-border">
              <tr>
                <th className="px-4 py-3">Usuario TikTok</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3 text-center">Comentarios</th>
                <th className="px-4 py-3 text-center">Ventas BD</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {transmisiones.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-hover transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-slate-100">
                    @{item.tiktokUsername}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.estado === 'ACTIVA'
                          ? 'bg-estado-validado/10 text-estado-validado border border-estado-validado/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(item.fechaInicio).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-brand-cyan">
                    {item.totalComentarios}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-estado-validado">
                    {item.totalVentas}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/live/${item.id}`}
                      className="text-brand-cyan hover:underline text-xs font-medium"
                    >
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
