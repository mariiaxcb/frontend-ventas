'use client'

import { Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-brand-primary/20 bg-brand-dark px-6 text-slate-100">
      <div />
      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 text-slate-400 hover:bg-brand-primary/10 hover:text-brand-cyan transition-colors">
          <Bell size={18} />
        </button>
        <span className="text-sm font-inter font-medium text-slate-200">
          {user?.username ?? 'User'}
        </span>
        <button
          onClick={logout}
          className="rounded-md p-2 text-slate-400 hover:bg-brand-primary/10 hover:text-brand-cyan transition-colors"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
