"use client";

import { Users, MessageSquare, ShoppingCart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface LiveStatsProps {
  totalComentarios: number;
  totalPostulantes: number;
  totalVentas: number;
  tasaConversion: number;
}

export function LiveStats({
  totalComentarios,
  totalPostulantes,
  totalVentas,
  tasaConversion,
}: LiveStatsProps) {
  const stats = [
    {
      label: "Comentarios",
      value: totalComentarios,
      icon: MessageSquare,
      color: "text-brand-light",
    },
    {
      label: "Postulantes",
      value: totalPostulantes,
      icon: Users,
      color: "text-brand-cyan",
    },
    {
      label: "Ventas",
      value: totalVentas,
      icon: ShoppingCart,
      color: "text-estado-validado",
    },
    {
      label: "Conversión",
      value: `${tasaConversion}%`,
      icon: TrendingUp,
      color: "text-estado-pendiente",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-center gap-4">
          <div className={`rounded-lg bg-brand-primary/15 p-3 ${stat.color}`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="font-poppins text-xl font-bold text-slate-100">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
