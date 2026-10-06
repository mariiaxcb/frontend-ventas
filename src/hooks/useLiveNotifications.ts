"use client";

import { useState, useCallback, useRef } from "react";
import type { NotificacionLive } from "@/types/live";

export function useLiveNotifications() {
  const [notificaciones, setNotificaciones] = useState<NotificacionLive[]>([]);
  const contadorRef = useRef(0);

  const agregarNotificacion = useCallback(
    (notificacion: Omit<NotificacionLive, "id" | "timestamp">) => {
      contadorRef.current += 1;
      const nuevaNotificacion: NotificacionLive = {
        ...notificacion,
        id: `notif-${contadorRef.current}`,
        timestamp: new Date().toISOString(),
      };
      setNotificaciones((prev) => [nuevaNotificacion, ...prev].slice(0, 50));
    },
    []
  );

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
  }, []);

  return {
    notificaciones,
    agregarNotificacion,
    limpiarNotificaciones,
  };
}
