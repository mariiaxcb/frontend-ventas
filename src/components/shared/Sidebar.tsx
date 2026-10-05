'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Radio,
  Package,
  ClipboardList,
  BarChart3,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

const items = [
  { href: ROUTES.PRODUCTS, label: 'Productos', icon: Package },
  { href: ROUTES.LIVE, label: 'Transmision', icon: Radio },
  { href: ROUTES.ORDERS, label: 'Pedidos', icon: ClipboardList },
  { href: ROUTES.REPORTS, label: 'Reportes', icon: BarChart3 },
  { href: ROUTES.WHATSAPP, label: 'ChatBot', icon: Bot },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-surface-border bg-brand-dark text-slate-200">
      <div className="border-b border-surface-border px-6 py-6 font-poppins text-lg font-bold tracking-wide text-brand-cyan">
        TikTok Live Sales
      </div>
      <nav className="flex-1 space-y-1.5 px-3 py-6">
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
    </aside>
  )
}