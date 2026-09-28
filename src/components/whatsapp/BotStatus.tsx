"use client";

import { Bot, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface BotStatusProps {
  status: "CONNECTED" | "DISCONNECTED" | "QR_READY" | "INITIALIZING";
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
}

export function BotStatus({ status, onStart, onStop, onRestart }: BotStatusProps) {
  const statusConfig = {
    CONNECTED: {
      icon: Wifi,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      label: "Conectado",
      description: "El bot está activo y procesando mensajes",
    },
    DISCONNECTED: {
      icon: WifiOff,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      label: "Desconectado",
      description: "El bot está inactivo",
    },
    QR_READY: {
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      label: "Esperando QR",
      description: "Escanea el código QR para conectar",
    },
    INITIALIZING: {
      icon: Bot,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      label: "Inicializando",
      description: "Conectando con WhatsApp...",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader
        title="Estado del Bot"
        subtitle={config.description}
        action={
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                status === "CONNECTED" && "animate-pulse bg-emerald-500",
                status === "QR_READY" && "animate-pulse bg-amber-500",
                status === "INITIALIZING" && "animate-spin bg-blue-400",
                status === "DISCONNECTED" && "bg-slate-500"
              )}
            />
            <span className={cn("text-xs font-semibold uppercase", config.color)}>
              {config.label}
            </span>
          </div>
        }
      />
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={cn("rounded-lg p-3", config.bg, config.color)}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-300">{config.description}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {status === "DISCONNECTED" && onStart && (
            <Button variant="primary" className="flex-1" onClick={onStart}>
              Iniciar Bot
            </Button>
          )}
          {status === "CONNECTED" && (
            <>
              {onStop && (
                <Button variant="danger" className="flex-1" onClick={onStop}>
                  Detener
                </Button>
              )}
              {onRestart && (
                <Button variant="outline" className="flex-1" onClick={onRestart}>
                  Reiniciar
                </Button>
              )}
            </>
          )}
          {status === "QR_READY" && onRestart && (
            <Button variant="outline" className="w-full" onClick={onRestart}>
              Re-generar QR
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
