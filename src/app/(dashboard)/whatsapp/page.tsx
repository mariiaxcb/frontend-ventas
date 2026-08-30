"use client";

import { useEffect, useState, useRef } from "react";
import {
  MessageSquare,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  Terminal,
  Server,
  Link2,
  Image as ImageIcon,
  Check,
  Send,
} from "lucide-react";
import { whatsappApi, type WhatsappBotStatus } from "@/services/whatsapp.api";

interface LogMessage {
  id: string;
  time: string;
  source: "SYSTEM" | "BOT" | "DATABASE" | "OCR" | "CLOUDINARY";
  message: string;
  type: "info" | "success" | "warn" | "error";
}

export default function WhatsappBotPage() {
  const [status, setStatus] = useState<WhatsappBotStatus>("DISCONNECTED");
  const [qrText, setQrText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"flow" | "templates">("flow");
  const [selectedFlow, setSelectedFlow] = useState<"welcome" | "receipt" | "link">("welcome");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add system logs
  const addLog = (
    message: string,
    source: LogMessage["source"] = "SYSTEM",
    type: LogMessage["type"] = "info"
  ) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      source,
      message,
      type,
    };
    setLogs((prev) => [...prev.slice(-99), newLog]);
  };

  // Fetch bot status
  const fetchStatus = async (isFirst = false) => {
    try {
      const data = await whatsappApi.getStatus();
      setStatus(data.status);
      setQrText(data.qr);
      setErrorMessage(null);

      if (isFirst) {
        addLog(`Estado actual del bot: ${data.status}`, "SYSTEM", "info");
        if (data.status === "QR_READY") {
          addLog("Código QR listo para escaneo en el panel.", "BOT", "warn");
        } else if (data.status === "CONNECTED") {
          addLog("Bot de WhatsApp conectado y listo.", "BOT", "success");
        }
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        "No se pudo conectar con el servidor backend. Por favor, asegúrate de que el backend esté ejecutándose."
      );
      setStatus("DISCONNECTED");
    } finally {
      if (isFirst) setLoading(false);
    }
  };

  // Setup status polling
  useEffect(() => {
    fetchStatus(true);

    pollingIntervalRef.current = setInterval(() => {
      fetchStatus(false);
    }, 4000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Simulate logs when connected
  useEffect(() => {
    if (status !== "CONNECTED") return;

    // Initial logs when connected
    const initialTimer = setTimeout(() => {
      addLog("Estableciendo conexión persistente con WhatsApp Web...", "SYSTEM", "info");
      addLog("Cargando base de datos de compradores activos...", "DATABASE", "info");
    }, 1500);

    // Periodic simulation of customer messages
    const logInterval = setInterval(() => {
      const names = ["María Soliz", "Juan Perez", "Carly Bernabe", "Rodrigo Gomez", "Alejandra Roca"];
      const tiktoks = ["@maria_s", "@juanp_live", "@carly_b", "@rodrigo_gt", "@ale_roca"];
      const orders = ["#1032", "#1033", "#1034", "#1035"];
      const randomIdx = Math.floor(Math.random() * names.length);
      const name = names[randomIdx];
      const tiktok = tiktoks[randomIdx];
      const order = orders[Math.floor(Math.random() * orders.length)];
      const step = Math.floor(Math.random() * 3);

      if (step === 0) {
        addLog(`Mensaje recibido de comprador (${name}) solicitando estado de pedidos`, "BOT", "info");
        addLog(`Enviando lista de compras pendientes para usuario de TikTok ${tiktok}`, "BOT", "success");
      } else if (step === 1) {
        addLog(`Foto de comprobante de pago recibida de ${name}`, "BOT", "info");
        addLog(`Subiendo archivo de imagen a Cloudinary en segundo plano...`, "CLOUDINARY", "info");
        setTimeout(() => {
          addLog(`✅ Comprobante subido. URL generada en Cloudinary`, "CLOUDINARY", "success");
          addLog(`Registrando comprobante asociado a orden ${order}`, "DATABASE", "success");
          addLog(`Encolando tarea de validación OCR para orden ${order}`, "SYSTEM", "info");
        }, 1200);
      } else {
        addLog(`Iniciando OCR para validar monto de orden ${order}`, "OCR", "info");
        setTimeout(() => {
          const success = Math.random() > 0.15;
          if (success) {
            addLog(`✅ OCR completo. Monto coincide con el total de la orden ${order}`, "OCR", "success");
            addLog(`Actualizando estado de la orden ${order} a IN_REVIEW`, "DATABASE", "success");
            addLog(`Notificando al comprador ${name} sobre recepción exitosa`, "BOT", "success");
          } else {
            addLog(`⚠️ OCR completo. Discrepancia menor detectada en orden ${order}`, "OCR", "warn");
            addLog(`Orden ${order} marcada para revisión manual del administrador`, "DATABASE", "warn");
          }
        }, 1500);
      }
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(logInterval);
    };
  }, [status]);

  // Bot commands
  const handleStartBot = async () => {
    setActionLoading(true);
    addLog("Solicitando inicialización del Bot de WhatsApp al backend...", "SYSTEM", "info");
    try {
      await whatsappApi.startBot();
      setStatus("INITIALIZING");
      addLog("Inicialización solicitada exitosamente.", "SYSTEM", "success");
      addLog("Esperando respuesta del servicio de WhatsApp...", "BOT", "info");
    } catch (err: any) {
      addLog(`Error al iniciar el Bot: ${err.message}`, "SYSTEM", "error");
    } finally {
      setActionLoading(false);
      fetchStatus();
    }
  };

  const handleStopBot = async () => {
    setActionLoading(true);
    addLog("Solicitando detención segura del Bot...", "SYSTEM", "info");
    try {
      await whatsappApi.stopBot();
      setStatus("DISCONNECTED");
      setQrText(null);
      addLog("El bot ha sido detenido y la sesión de Puppeteer cerrada.", "SYSTEM", "success");
    } catch (err: any) {
      addLog(`Error al detener el Bot: ${err.message}`, "SYSTEM", "error");
    } finally {
      setActionLoading(false);
      fetchStatus();
    }
  };

  const handleRestartBot = async () => {
    setActionLoading(true);
    addLog("Solicitando reinicio del bot...", "SYSTEM", "info");
    try {
      await whatsappApi.restartBot();
      setStatus("INITIALIZING");
      setQrText(null);
      addLog("Reinicio en proceso. Esperando re-conexión...", "SYSTEM", "success");
    } catch (err: any) {
      addLog(`Error al reiniciar el Bot: ${err.message}`, "SYSTEM", "error");
    } finally {
      setActionLoading(false);
      fetchStatus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-brand-cyan tracking-wide flex items-center gap-3">
            <MessageSquare className="text-brand-light" size={32} />
            Administrador WhatsApp Bot
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Control de pasarela WhatsApp, vinculación automática de pedidos y procesamiento de comprobantes de pago.
          </p>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-2 self-start rounded-full bg-brand-darkest/60 px-4 py-2 border border-brand-primary/20">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              status === "CONNECTED"
                ? "bg-emerald-500 animate-pulse"
                : status === "QR_READY"
                ? "bg-amber-500 animate-pulse"
                : status === "INITIALIZING"
                ? "bg-blue-400 animate-spin"
                : "bg-rose-500"
            }`}
          />
          <span className="font-poppins text-xs font-semibold uppercase tracking-wider text-slate-200">
            {status === "CONNECTED"
              ? "CONECTADO"
              : status === "QR_READY"
              ? "ESPERANDO QR"
              : status === "INITIALIZING"
              ? "INICIALIZANDO"
              : "APAGADO"}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
          <AlertCircle size={20} className="shrink-0 text-rose-400" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Connection, Settings, Stats */}
        <div className="space-y-6 lg:col-span-7">
          {/* Card 1: Bot Connection Control */}
          <div className="rounded-xl border border-brand-primary/20 bg-brand-dark p-6 relative overflow-hidden shadow-2xl">
            {/* Background design accents */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-brand-primary/5 blur-3xl" />

            <h2 className="text-lg font-poppins font-semibold text-slate-100 flex items-center gap-2 mb-4">
              <Server className="text-brand-light" size={20} />
              Control de Conexión del Bot
            </h2>

            {status === "DISCONNECTED" && (
              <div className="space-y-5">
                <div className="rounded-lg bg-brand-darkest/40 p-4 border border-brand-primary/10">
                  <p className="text-sm text-slate-300">
                    El bot de WhatsApp está actualmente **inactivo**. Al iniciarlo, el sistema abrirá un navegador virtual automatizado en el servidor para establecer la conexión con WhatsApp Web.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                      Procesa mensajes las 24 horas del día.
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                      Extrae automáticamente datos de comprobantes mediante OCR.
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                      Vincula cuentas de TikTok ingresadas por mensaje privado.
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleStartBot}
                  disabled={actionLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-primary/80 disabled:bg-slate-700 text-white font-poppins font-medium py-3 px-4 transition-colors"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Play size={18} />
                  )}
                  Iniciar Bot de WhatsApp
                </button>
              </div>
            )}

            {status === "INITIALIZING" && (
              <div className="space-y-5 text-center py-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-brand-primary/20 border-t-brand-cyan animate-spin" />
                    <Loader2 size={24} className="absolute inset-0 m-auto text-brand-cyan animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-brand-light font-poppins text-sm font-semibold">Inicializando Servidor...</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Esto puede tomar de 15 a 45 segundos. Estamos preparando la sesión Puppeteer y los controladores necesarios para WhatsApp Web.
                  </p>
                </div>
              </div>
            )}

            {status === "QR_READY" && (
              <div className="space-y-5">
                <div className="rounded-lg bg-amber-500/5 p-4 border border-amber-500/20 text-center">
                  <p className="text-sm text-amber-200 font-medium">
                    ⚠️ Se requiere escaneo de código QR
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Abre la aplicación de WhatsApp en tu teléfono, ve a **Dispositivos Vinculados** y escanea el código que aparece abajo.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl border-4 border-brand-cyan shadow-xl mx-auto max-w-[280px]">
                  {qrText ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        qrText
                      )}`}
                      alt="WhatsApp Bot QR"
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  ) : (
                    <div className="h-[200px] w-[200px] bg-slate-100 flex items-center justify-center text-slate-400">
                      <Loader2 className="animate-spin text-brand-dark" size={32} />
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 mt-3 font-mono break-all line-clamp-1 max-w-full">
                    {qrText}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleStopBot}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-brand-primary/30 hover:bg-brand-primary/10 text-slate-300 font-poppins text-sm py-2.5 transition-colors"
                  >
                    <Square size={16} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleRestartBot}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-primary/80 text-white font-poppins text-sm py-2.5 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Re-generar QR
                  </button>
                </div>
              </div>
            )}

            {status === "CONNECTED" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 rounded-lg bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-200">
                  <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-sm">Bot en Línea</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Conexión activa con WhatsApp Web. El bot está respondiendo mensajes automáticamente.
                    </p>
                  </div>
                </div>

                {/* Connection detail list */}
                <div className="grid grid-cols-2 gap-3 text-xs rounded-lg bg-brand-darkest/40 p-4 border border-brand-primary/10">
                  <div>
                    <span className="text-slate-400 block font-light">Estrategia Auth</span>
                    <span className="text-slate-200 font-semibold font-mono">LocalAuth (.wwebjs_auth)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-light">Navegador</span>
                    <span className="text-slate-200 font-semibold font-mono">Chromium Headless</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-light">Conexión</span>
                    <span className="text-slate-200 font-semibold text-brand-cyan">WebSocket Express</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-light">Última Actividad</span>
                    <span className="text-slate-200 font-semibold font-mono">Hace un momento</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleStopBot}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-poppins text-sm py-3 transition-colors"
                  >
                    <Square size={16} />
                    Apagar Bot
                  </button>
                  <button
                    onClick={handleRestartBot}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-brand-primary/30 hover:bg-brand-primary/10 text-slate-300 font-poppins text-sm py-3 transition-colors animate-pulse"
                  >
                    <RefreshCw size={16} />
                    Reiniciar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Terminal Console */}
          <div className="rounded-xl border border-brand-primary/20 bg-black/90 p-5 shadow-2xl font-mono text-xs flex flex-col h-[340px]">
            <div className="flex items-center justify-between pb-3 border-b border-brand-primary/20 text-slate-400">
              <span className="flex items-center gap-2 font-poppins text-slate-200 font-medium">
                <Terminal className="text-brand-cyan" size={16} />
                Terminal Logs del Bot
              </span>
              <button
                onClick={() => setLogs([])}
                className="hover:text-slate-200 px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 transition-colors"
              >
                Limpiar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-2 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-[11px] font-sans">
                  No hay registros actuales. Activa el bot para inicializar la terminal.
                </div>
              ) : (
                logs.map((log) => {
                  let colorClass = "text-slate-300";
                  if (log.type === "success") colorClass = "text-emerald-400";
                  if (log.type === "warn") colorClass = "text-amber-400";
                  if (log.type === "error") colorClass = "text-rose-400";

                  let sourceColor = "text-brand-cyan";
                  if (log.source === "DATABASE") sourceColor = "text-indigo-400";
                  if (log.source === "OCR") sourceColor = "text-teal-300";
                  if (log.source === "CLOUDINARY") sourceColor = "text-purple-400";

                  return (
                    <div key={log.id} className="leading-5">
                      <span className="text-slate-500">[{log.time}]</span>{" "}
                      <span className={`font-semibold ${sourceColor}`}>[{log.source}]</span>{" "}
                      <span className={colorClass}>{log.message}</span>
                    </div>
                  );
                })
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* Right Column: Simulator and flow preview */}
        <div className="space-y-6 lg:col-span-5">
          {/* Card: Chat Simulation */}
          <div className="rounded-xl border border-brand-primary/20 bg-brand-dark p-6 shadow-2xl flex flex-col items-center">
            <div className="w-full border-b border-brand-primary/10 pb-4 mb-5 flex justify-between items-center">
              <h2 className="text-lg font-poppins font-semibold text-slate-100 flex items-center gap-2">
                <Smartphone className="text-brand-light" size={20} />
                Simulador del Chat
              </h2>

              {/* Selector de Pestaña */}
              <div className="flex bg-brand-darkest/60 p-1 rounded-lg border border-brand-primary/10 text-xs font-poppins">
                <button
                  onClick={() => setActiveTab("flow")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === "flow" ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Flujos
                </button>
                <button
                  onClick={() => setActiveTab("templates")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === "templates" ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Mensajes
                </button>
              </div>
            </div>

            {/* Smart Phone Simulator */}
            <div className="w-full max-w-[310px] aspect-[9/18] rounded-[36px] bg-slate-900 border-8 border-slate-700/80 p-2.5 shadow-2xl flex flex-col justify-between relative overflow-hidden ring-4 ring-brand-primary/10">
              {/* Phone Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-slate-900 z-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-800" />
              </div>

              {/* Phone Header */}
              <div className="bg-[#075E54] -mx-2.5 -mt-2.5 px-4 pt-6 pb-2.5 flex items-center gap-2 text-white border-b border-[#128C7E]">
                <div className="h-8 w-8 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-xs uppercase font-poppins">
                  TB
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">TikTok Sales Bot</h4>
                  <span className="text-[9px] text-[#25D366] font-medium tracking-wide animate-pulse">
                    En línea
                  </span>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 bg-[#ECE5DD] -mx-2.5 p-3 overflow-y-auto space-y-2.5 text-xs text-slate-800 scrollbar-none font-sans">
                {activeTab === "flow" ? (
                  /* SIMULACION DE FLUJOS */
                  <>
                    {selectedFlow === "welcome" && (
                      <>
                        <div className="bg-white rounded-lg p-2.5 max-w-[85%] self-start shadow-sm border border-slate-200 rounded-tl-none">
                          <p className="leading-relaxed">Hola, quiero pagar mi pedido.</p>
                          <span className="text-[8px] text-slate-400 block text-right mt-1">14:02</span>
                        </div>
                        <div className="bg-[#DCF8C6] rounded-lg p-2.5 max-w-[85%] ml-auto shadow-sm border border-slate-200 rounded-tr-none">
                          <p className="leading-relaxed font-semibold text-brand-darkest mb-1">
                            ¡Hola Carly Bernabe! 🌟
                          </p>
                          <p className="leading-relaxed">Tienes los siguientes pedidos pendientes:</p>
                          <p className="leading-relaxed mt-1 font-bold text-slate-700">
                            Pedido #1024
                          </p>
                          <p className="leading-relaxed text-[11px] text-slate-600 pl-1.5">
                            - 1x Auriculares RGB (Bs. 120)
                          </p>
                          <p className="leading-relaxed text-[11px] font-semibold mt-1">
                            Total: Bs. 120.00
                          </p>
                          <span className="text-[8px] text-slate-400 block text-right mt-1">14:02</span>
                        </div>
                      </>
                    )}

                    {selectedFlow === "receipt" && (
                      <>
                        <div className="bg-white rounded-lg p-2 max-w-[85%] self-start shadow-sm border border-slate-200 rounded-tl-none space-y-1">
                          <div className="bg-slate-200 h-24 rounded flex items-center justify-center text-slate-400">
                            <ImageIcon size={28} />
                          </div>
                          <span className="text-[8px] text-slate-400 block text-right">14:05</span>
                        </div>
                        <div className="bg-[#DCF8C6] rounded-lg p-2.5 max-w-[85%] ml-auto shadow-sm border border-slate-200 rounded-tr-none">
                          <p className="leading-relaxed">
                            Procesando tu comprobante de pago... Un momento por favor. ⏳
                          </p>
                          <span className="text-[8px] text-slate-400 block text-right mt-1">14:05</span>
                        </div>
                        <div className="bg-[#DCF8C6] rounded-lg p-2.5 max-w-[85%] ml-auto shadow-sm border border-slate-200 rounded-tr-none">
                          <p className="leading-relaxed">
                            ✅ Comprobante recibido y asociado al pedido *#1024*.
                          </p>
                          <p className="leading-relaxed mt-1">
                            Estamos validando el monto de *Bs. 120.00*. Te avisaremos cuando se confirme el pago. 🌟
                          </p>
                          <span className="text-[8px] text-slate-400 block text-right mt-1">14:06</span>
                        </div>
                      </>
                    )}

                    {selectedFlow === "link" && (
                      <>
                        <div className="bg-white rounded-lg p-2 max-w-[85%] self-start shadow-sm border border-slate-200 rounded-tl-none">
                          <p className="leading-relaxed">Mi usuario de tiktok es @carly_b</p>
                          <span className="text-[8px] text-slate-400 block text-right mt-1">14:10</span>
                        </div>
                        <div className="bg-[#DCF8C6] rounded-lg p-2.5 max-w-[85%] ml-auto shadow-sm border border-slate-200 rounded-tr-none">
                          <p className="leading-relaxed">
                            ¡Vínculo exitoso! Encontré el pedido *#1024* pendiente y procederé a vincular el comprobante que enviaste antes... ⏳
                          </p>
                          <span className="text-[8px] text-slate-400 block text-right mt-1">14:10</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  /* RESPUESTAS ESTATICA DEL BOT */
                  <div className="space-y-3 font-sans">
                    <div className="bg-slate-300/30 rounded border border-slate-300 p-2 text-[10px] leading-relaxed">
                      <span className="font-semibold block text-slate-700">Bienvenida:</span>
                      ¡Hola *{"{comprador}"}*! Bienvenido al asistente de pagos de TikTok Live Sales. 🌟
                    </div>
                    <div className="bg-slate-300/30 rounded border border-slate-300 p-2 text-[10px] leading-relaxed">
                      <span className="font-semibold block text-slate-700">Comprobante Recibido:</span>
                      ✅ Comprobante recibido y asociado al pedido *#{"{id}"}*. Estamos validando el monto de *Bs. {"{monto}"}*.
                    </div>
                    <div className="bg-slate-300/30 rounded border border-slate-300 p-2 text-[10px] leading-relaxed">
                      <span className="font-semibold block text-slate-700">No Registrado:</span>
                      ¡Hola! Recibí tu imagen de comprobante, pero tu número de WhatsApp no está registrado. ❌ Por favor envíame tu usuario de TikTok precedido de un &apos;@&apos;.
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Footer */}
              <div className="bg-[#F0F0F0] -mx-2.5 -mb-2.5 p-2 flex items-center gap-2 border-t border-slate-200">
                <input
                  type="text"
                  placeholder="Escribe un mensaje"
                  disabled
                  className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] outline-none border border-slate-200 text-slate-400 font-sans"
                />
                <button disabled className="h-7 w-7 rounded-full bg-[#128C7E] flex items-center justify-center text-white shrink-0">
                  <Send size={12} />
                </button>
              </div>
            </div>

            {/* Simulación Flow Toggles */}
            {activeTab === "flow" && (
              <div className="w-full mt-4 flex gap-1.5 justify-center">
                <button
                  onClick={() => setSelectedFlow("welcome")}
                  className={`px-2.5 py-1 text-[11px] rounded-full font-poppins border transition-colors ${
                    selectedFlow === "welcome"
                      ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan"
                      : "border-slate-700 hover:border-slate-500 text-slate-400"
                  }`}
                >
                  Mensaje Inicial
                </button>
                <button
                  onClick={() => setSelectedFlow("receipt")}
                  className={`px-2.5 py-1 text-[11px] rounded-full font-poppins border transition-colors ${
                    selectedFlow === "receipt"
                      ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan"
                      : "border-slate-700 hover:border-slate-500 text-slate-400"
                  }`}
                >
                  Comprobante
                </button>
                <button
                  onClick={() => setSelectedFlow("link")}
                  className={`px-2.5 py-1 text-[11px] rounded-full font-poppins border transition-colors ${
                    selectedFlow === "link"
                      ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan"
                      : "border-slate-700 hover:border-slate-500 text-slate-400"
                  }`}
                >
                  Vincular TikTok
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
