"use client";

import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { usuario, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100">
          <Bell size={18} />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {usuario?.nombre ?? "Usuario"}
        </span>
        <button
          onClick={logout}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
