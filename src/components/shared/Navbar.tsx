'use client'

import { LogOut, Radio } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="relative flex h-20 items-center justify-between border-b border-surface-border/60 bg-brand-dark/85 px-8 text-slate-100 backdrop-blur-md overflow-hidden">
      {/* 1. Textura de Fondo y Gradientes Dinámicos */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" 
      />
      
      {/* Resplandor ambiental de luz dinámico */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-brand-cyan/20 blur-2xl animate-pulse" 
      />

      {/* 2. Título del Sistema: Ventas Live (Ícono y Texto más grandes) */}
      <div className="relative z-10 flex items-center gap-3.5">
        {/* Contenedor del ícono ampliado (h-11 w-11) e ícono Radio size={24} */}
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shadow-[0_0_16px_rgba(56,189,248,0.3)]">
          <Radio size={24} className="animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>

        {/* Texto ampliado a text-2xl / text-3xl en pantallas medianas */}
        <span className="select-none font-poppins text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-white via-slate-100 to-brand-cyan bg-clip-text text-transparent drop-shadow-sm">
          Ventas <span className="bg-gradient-to-r from-brand-cyan to-emerald-400 bg-clip-text text-transparent">Live</span>
        </span>
      </div>

      {/* 3. Área de Usuario y Estado */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="select-none cursor-default text-sm font-semibold text-slate-200">
            Sistema de ventas
          </span>
          <span className="select-none text-xs text-emerald-400 font-medium flex items-center justify-end gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            En línea
          </span>
        </div>
      </div>
    </header>
  )
}