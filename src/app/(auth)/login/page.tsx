"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/api.client";
import { ROUTES } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    setError(null);
    try {
      const { data } = await apiClient.post("/auth/login", values);
      login(data.token, data.usuario);
      router.push(ROUTES.DASHBOARD);
    } catch {
      setError("Credenciales inválidas.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-primary">
          TikTok Live Sales
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Ingresa a tu panel de administración
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            placeholder="Correo electrónico"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            error={errors.password?.message}
            {...register("password")}
          />
          {error && <p className="text-sm text-estado-rechazado">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
