"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextValue {
  socket: Socket | null;
  conectado: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  conectado: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080",
      {
        auth: { token },
        transports: ["websocket"],
      }
    );

    socket.on("connect", () => setConectado(true));
    socket.on("disconnect", () => setConectado(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, conectado }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
