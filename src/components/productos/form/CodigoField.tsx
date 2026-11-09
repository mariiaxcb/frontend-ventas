import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { EstadoCodigo } from "@/hooks/useEstadoCodigo";

interface CodigoFieldProps {
  value: string;
  onChange: (valor: string) => void;
  estado: EstadoCodigo;
}

export function CodigoField({ value, onChange, estado }: CodigoFieldProps) {
  const { existe, valido, validando } = estado;

  return (
    <>
      <div className="relative">
        <Input
          placeholder="Ej. PROD-001"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className={
            existe
              ? "border-estado-rechazado focus:ring-estado-rechazado/20"
              : valido
              ? "border-green-500 focus:ring-green-500"
              : ""
          }
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
          {validando && <Loader2 size={18} className="animate-spin text-slate-400" />}
          {!validando && valido && <CheckCircle2 size={18} className="text-green-500" />}
          {!validando && existe && <AlertCircle size={18} className="text-estado-rechazado" />}
        </div>
      </div>

      {existe && <p className="mt-1 text-xs text-estado-rechazado">El código ya está en uso.</p>}
      {valido && <p className="mt-1 text-xs text-green-400">Código disponible.</p>}
    </>
  );
}