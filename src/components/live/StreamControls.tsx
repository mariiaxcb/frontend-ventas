"use client";

import { Play, Square, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

interface StreamControlsProps {
  isLive: boolean;
  streamTitle?: string;
  tiktokUsername?: string;
  onStart?: () => void;
  onStop?: () => void;
}

export function StreamControls({
  isLive,
  streamTitle,
  tiktokUsername,
  onStart,
  onStop,
}: StreamControlsProps) {
  return (
    <Card>
      <CardHeader
        title="Control de Transmisión"
        subtitle={isLive ? "Transmisión en vivo" : "Sin transmisión activa"}
        action={
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isLive ? "animate-pulse bg-emerald-500" : "bg-slate-500"
              }`}
            />
            <span className="text-xs font-medium text-slate-400">
              {isLive ? "EN VIVO" : "OFFLINE"}
            </span>
          </div>
        }
      />
      <CardContent>
        {isLive ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-brand-darkest/50 p-4">
              <p className="mb-1 text-xs text-slate-400">Título</p>
              <p className="font-poppins text-sm font-semibold text-slate-100">
                {streamTitle || "Sin título"}
              </p>
              {tiktokUsername && (
                <p className="mt-1 text-xs text-brand-light">@{tiktokUsername}</p>
              )}
            </div>
            <Button variant="danger" className="w-full" onClick={onStop}>
              <Square size={16} />
              Finalizar Transmisión
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Inicia una nueva transmisión para comenzar a recibir comentarios y
              registrar reservas automáticamente.
            </p>
            <Button variant="primary" className="w-full" onClick={onStart}>
              <Play size={16} />
              Iniciar Transmisión
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
