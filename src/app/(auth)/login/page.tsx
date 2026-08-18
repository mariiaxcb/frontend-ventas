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
  password: z.string().min(3, "Mínimo 3 caracteres"),
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
    // 1. Asegúrate de incluir /api/v1 si no está configurado en apiClient.defaults.baseURL
    // 2. Si tu backend espera 'username', mapeamos 'email' a 'username'
    const { data } = await apiClient.post("/api/v1/auth/login", {
      username: values.email,
      password: values.password,
    });

    // 3. Tu backend devuelve 'user' (no 'usuario')
    login(data.token, data.user);

    router.push(ROUTES.DASHBOARD);
  } catch (err: any) {
    console.error("Error al iniciar sesión:", err);
    if (!err.response) {
      setError("Error de conexión. Verifica que el backend esté encendido y la URL en el archivo .env sea correcta.");
    } else if (err.response.status === 404) {
      setError("Ruta no encontrada. Revisa la URL y el puerto del backend.");
    } else if (err.response.status === 401 || err.response.status === 400) {
      setError("Credenciales inválidas.");
    } else {
      setError(err.response.data?.mensaje || err.response.data?.message || "Error al intentar ingresar.");
    }
  }
}

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-darkest px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-lg border border-brand-primary/20 bg-brand-dark p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-poppins font-bold text-brand-cyan tracking-wide">
          TikTok Live Sales
        </h1>
        <p className="mb-6 text-sm font-inter text-slate-400">
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
          {error && <p className="text-sm font-inter text-estado-rechazado">{error}</p>}
          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
