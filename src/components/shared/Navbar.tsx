'use client'

import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-border bg-brand-dark px-6 text-slate-100">
      <div />
      <div className="flex items-center gap-4">
        {/*
          `select-none` + `cursor-default`: sin esto el navegador selecciona el
          texto al hacer clic y muestra el cursor de selección sobre el nombre.
        */}
        <span className="select-none cursor-default text-sm font-inter font-medium text-slate-200">
          {user?.username ?? 'User'}
        </span>
        <button
          onClick={logout}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-brand-primary/15 hover:text-brand-cyan"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}