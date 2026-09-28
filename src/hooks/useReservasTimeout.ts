"use client";

import { useEffect, useRef, useCallback } from "react";

interface ReservaTimeout {
  id: string;
  usuarioTiktok: string;
  productoCode: string;
  productoNombre: string;
  timestamp: number;
  timeoutMs: number;
}

export function useReservasTimeout(onTimeout: (reserva: ReservaTimeout) => void) {
  const reservasRef = useRef<Map<string, ReservaTimeout>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const agregarReserva = useCallback(
    (reserva: Omit<ReservaTimeout, "timestamp">) => {
      const nuevaReserva: ReservaTimeout = {
        ...reserva,
        timestamp: Date.now(),
      };

      reservasRef.current.set(reserva.id, nuevaReserva);

      const timeoutId = setTimeout(() => {
        reservasRef.current.delete(reserva.id);
        timeoutsRef.current.delete(reserva.id);
        onTimeout(nuevaReserva);
      }, reserva.timeoutMs);

      timeoutsRef.current.set(reserva.id, timeoutId);
    },
    [onTimeout]
  );

  const confirmarReserva = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    reservasRef.current.delete(id);
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
      reservasRef.current.clear();
    };
  }, []);

  return { agregarReserva, confirmarReserva };
}
