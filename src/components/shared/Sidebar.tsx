'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Radio,
  Package,
  ClipboardList,
  BarChart3,
  Bot,
  User,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'

const items = [
  { href: ROUTES.PRODUCTS, label: 'Productos', icon: Package },
  { href: ROUTES.LIVE, label: 'Transmisión', icon: Radio },
  { href: ROUTES.ORDERS, label: 'Pedidos', icon: ClipboardList },
  { href: ROUTES.REPORTS, label: 'Reportes', icon: BarChart3 },
  { href: ROUTES.WHATSAPP, label: 'ChatBot', icon: Bot },
  { href: ROUTES.PERFIL, label: 'Perfil', icon: User },
]

const TITLE_CLASS =
  'font-poppins text-lg font-bold tracking-wide text-brand-cyan'

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-surface-hover hover:text-slate-100',
              isActive &&
                'border-l-2 border-brand-cyan bg-brand-primary/15 pl-2 font-semibold text-brand-cyan',
            )}
          >
            <Icon
              size={18}
              className={cn(
                'transition-colors',
                isActive ? 'text-brand-cyan' : 'text-slate-400',
              )}
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function UserFooter() {
  const { user, logout } = useAuth()

  return (
    <div className="flex items-center justify-between border-t border-surface-border p-3">
      <div className="flex flex-col min-w-0 px-1">
        <span className="truncate text-xs font-semibold text-slate-200">
          {user?.username ?? 'Usuario'}
        </span>
        <span className="truncate text-[10px] text-slate-400">
          {user?.email ?? 'Sesión activa'}
        </span>
      </div>

      {/* Botón de Salir: Solo Ícono con Hover Tooltip */}
      <div className="relative group shrink-0">
        <button
          type="button"
          onClick={logout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
        </button>
        <span className="absolute -top-8 right-0 hidden group-hover:block bg-surface-border text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-50 pointer-events-none">
          Cerrar sesión
        </span>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Cierra el menú al cambiar de página
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Escape cierra y se bloquea el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      {/* ESCRITORIO */}
      <aside className="hidden h-[calc(100vh-5rem)] w-60 shrink-0 flex-col border-r border-surface-border bg-brand-dark text-slate-200 md:flex overflow-hidden">
  <NavLinks pathname={pathname} />
  <UserFooter />
</aside>

      {/* MÓVIL: barra superior */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-surface-border bg-brand-dark px-4 md:hidden">
        <span className={TITLE_CLASS}>TikTok Live Sales</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="rounded-md p-2 text-slate-300 transition-colors hover:bg-surface-hover hover:text-slate-100"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* MÓVIL: fondo oscuro */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* MÓVIL: menú desplegable */}
      <aside
        id="mobile-menu"
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 max-w-[80vw] flex-col border-r border-surface-border bg-brand-dark text-slate-200 transition-transform duration-200 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-4">
          <span className={TITLE_CLASS}>TikTok Live Sales</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="rounded-md p-2 text-slate-300 transition-colors hover:bg-surface-hover hover:text-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        <NavLinks pathname={pathname} />
        <UserFooter />
      </aside>
    </>
  )
}