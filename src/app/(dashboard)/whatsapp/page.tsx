"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  QrCode,
  Loader2,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  ArrowRight,
  ServerCrash,
  PlugZap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useBotStatus,
  useBotLogout,
  useBotConnect,
} from "@/hooks/useBotStatus";
import type { BotStatus } from "@/services/bot.api";
import { cn } from "@/lib/utils";

/** Estado visual del bot: color, icono y texto. */
const STATUS_VIEW: Record<
  BotStatus,
  {
    label: string;
    description: string;
    dot: string;
    text: string;
    icon: typeof CheckCircle2;
  }
> = {
  CONNECTED: {
    label: "Conectado",
    description: "El bot responde mensajes y confirma los pagos de tus clientes.",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  QR_READY: {
    label: "Esperando QR",
    description: "Escanea el código con tu WhatsApp para vincular el dispositivo.",
    dot: "bg-amber-500",
    text: "text-amber-400",
    icon: QrCode,
  },
  INITIALIZING: {
    label: "Conectando",
    description: "El bot se está conectando con WhatsApp. Espera un momento.",
    dot: "bg-blue-400",
    text: "text-blue-400",
    icon: Loader2,
  },
  DISCONNECTED: {
    label: "Desconectado",
    description: "Sin sesión activa. Pide un código QR para volver a conectar.",
    dot: "bg-red-500",
    text: "text-red-400",
    icon: AlertTriangle,
  },
};

/** Pasos para vincular el dispositivo desde el celular. */
const PASOS_VINCULAR = [
  "En tu celular abre WhatsApp y ve a Dispositivos vinculados.",
  "Toca en Vincular dispositivo y escanea el QR de arriba.",
  "Vuelve a esta página: el estado debe marcarte como Conectado.",
];

export default function ChatBotPage() {
  const { data, isLoading, isError, refetch, isFetching } = useBotStatus();
  const cerrarSesion = useBotLogout();
  const conectar = useBotConnect();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const status: BotStatus = data?.status ?? "DISCONNECTED";
  const view = STATUS_VIEW[status];
  const StatusIcon = view.icon;
  const conectado = status === "CONNECTED";

  async function handleLogout() {
    try {
      await cerrarSesion.mutateAsync();
      toast.success("Sesión cerrada. Escanea el QR para conectar de nuevo.");
      setConfirmLogout(false);
    } catch (error: any) {
      toast.error(error?.message || "No se pudo cerrar la sesión");
    }
  }

  async function handleConnect() {
    try {
      await conectar.mutateAsync();
      toast.success("Generando un nuevo código QR");
    } catch (error: any) {
      toast.error(error?.message || "No se pudo generar el QR");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ChatBot"
        subtitle="Vincula tu número de WhatsApp para que el bot atienda a tus compradores"
      />

      {/* Estado principal */}
      <Card
        className={cn(
          "border-2",
          conectado && "border-emerald-500/40",
          status === "QR_READY" && "border-amber-500/40",
          status === "INITIALIZING" && "border-blue-500/40",
          (status === "DISCONNECTED" || isError) && "border-red-500/40"
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "rounded-full p-3",
                conectado && "bg-emerald-500/10",
                status === "QR_READY" && "bg-amber-500/10",
                status === "INITIALIZING" && "bg-blue-500/10",
                (status === "DISCONNECTED" || isError) && "bg-red-500/10"
              )}
            >
              <StatusIcon
                size={28}
                className={cn(
                  view.text,
                  status === "INITIALIZING" && "animate-spin"
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-3 w-3 rounded-full",
                    view.dot,
                    conectado && "animate-pulse"
                  )}
                />
                <p className="font-poppins text-xl font-bold text-slate-100">
                  {isError ? "Bot no disponible" : view.label}
                </p>
              </div>
              <p className="mt-1 max-w-md text-sm text-slate-400">
                {isError
                  ? "No pudimos comunicarnos con el bot. Verifica que esté ejecutándose."
                  : view.description}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Actualizar
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Código QR */}
        <Card>
          <CardHeader
            title="Vincular dispositivo"
            subtitle="Escanea el QR desde tu celular para conectar el bot"
          />
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 size={28} className="animate-spin text-brand-cyan" />
              </div>
            ) : status === "QR_READY" && data?.qr ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-xl border-4 border-brand-cyan bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      data.qr
                    )}`}
                    alt="Código QR de WhatsApp"
                    width={240}
                    height={240}
                  />
                </div>
                <p className="text-center text-xs text-slate-400">
                  Escanealo ahora: el código caduca en pocos segundos.
                </p>
              </div>
            ) : conectado ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                <CheckCircle2 size={40} className="text-emerald-400" />
                <p className="text-sm text-slate-300">
                  Tu dispositivo ya está vinculado.
                </p>
                <p className="text-xs text-slate-400">
                  No necesitas escanear nada más mientras la sesión siga activa.
                </p>
              </div>
            ) : status === "INITIALIZING" ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                <Loader2 size={36} className="animate-spin text-blue-400" />
                <p className="text-sm text-slate-300">Generando el código QR</p>
                <p className="text-xs text-slate-400">
                  El QR aparecerá aquí en unos segundos.
                </p>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
                {isError ? (
                  <ServerCrash size={40} className="text-slate-600" />
                ) : (
                  <PlugZap size={40} className="text-slate-600" />
                )}
                <p className="text-sm text-slate-300">
                  {isError
                    ? "No hay ningún bot conectado"
                    : "No hay un código QR disponible"}
                </p>
                <p className="max-w-xs text-xs text-slate-400">
                  {isError
                    ? "Inicia el bot en su terminal y presiona el botón para generar el QR."
                    : "Pide un nuevo código QR para vincular tu número."}
                </p>
                <Button
                  variant="primary"
                  onClick={handleConnect}
                  disabled={conectar.isPending}
                >
                  {conectar.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  {isError ? "Reintentar" : "Generar QR"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones y pasos */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Cerrar sesión de WhatsApp"
              subtitle="Desvincula el dispositivo de este bot"
            />
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Al cerrar sesión el bot dejará de responder mensajes y generates un
                QR nuevo para volver a conectarlo.
              </p>

              {confirmLogout ? (
                <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                  <p className="text-sm font-medium text-red-300">
                    ¿Seguro que quieres cerrar la sesión?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={handleLogout}
                      disabled={cerrarSesion.isPending}
                    >
                      {cerrarSesion.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <LogOut size={16} />
                      )}
                      Sí, cerrar sesión
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setConfirmLogout(false)}
                      disabled={cerrarSesion.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setConfirmLogout(true)}
                  disabled={!conectado}
                >
                  <LogOut size={16} />
                  Cerrar sesión de WhatsApp
                </Button>
              )}

              {!conectado && !confirmLogout && (
                <p className="text-xs text-slate-500">
                  Solo puedes cerrar sesión si el bot está conectado.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Cómo conectar tu WhatsApp"
              subtitle="Solo la primera vez"
            />
            <CardContent>
              <ol className="space-y-3">
                {PASOS_VINCULAR.map((paso, index) => (
                  <li key={paso} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-semibold text-brand-cyan">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-300">{paso}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Requisito para transmitir */}
      {!conectado && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Smartphone
                size={20}
                className="mt-0.5 shrink-0 text-amber-400"
              />
              <div>
                <p className="text-sm font-medium text-amber-200">
                  No puedes iniciar una transmisión todavía
                </p>
                <p className="mt-0.5 text-xs text-amber-200/70">
                  El bot necesita estar conectado para confirmar las reservas y
                  los pagos de tus clientes.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="shrink-0 border-amber-500/40 text-amber-300"
              onClick={handleConnect}
              disabled={conectar.isPending}
            >
              Ir a ChatBot
              <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}