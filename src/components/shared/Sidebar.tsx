"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Package,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const items = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.LIVE, label: "Live", icon: Radio },
  { href: ROUTES.PRODUCTOS, label: "Productos", icon: Package },
  { href: ROUTES.PEDIDOS, label: "Pedidos", icon: ClipboardList },
  { href: ROUTES.REPORTES, label: "Reportes", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-brand-primary/20 bg-brand-dark text-slate-200">
      <div className="px-6 py-6 font-poppins font-bold text-lg text-brand-cyan tracking-wide border-b border-brand-primary/10">
        TikTok Live Sales
      </div>
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {items.map(({ href, label, icon: Icon }) => {
          const activo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-brand-primary/10 hover:text-slate-100 transition-all duration-200",
                activo && "bg-brand-primary/20 text-brand-cyan font-semibold border-l-2 border-brand-cyan pl-2"
              )}
            >
              <Icon size={18} className={cn("transition-colors", activo ? "text-brand-cyan" : "text-slate-400")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
