import { useValidarCodigo } from "@/hooks/useProductos";

export interface EstadoCodigo {
  existe: boolean;
  valido: boolean;
  validando: boolean;
}

/** `codigoOriginal` evita marcar como duplicado el código propio al editar. */
export function useEstadoCodigo(codigo: string, codigoOriginal = ""): EstadoCodigo {
  const { data, isLoading } = useValidarCodigo(codigo);

  const cambio = codigo.trim() !== codigoOriginal.trim();
  const existe = cambio && (data?.exists ?? false);
  const valido = cambio && codigo.trim().length > 0 && !existe && !isLoading;

  return { existe, valido, validando: isLoading };
}