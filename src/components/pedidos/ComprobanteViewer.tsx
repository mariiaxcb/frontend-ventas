import Image from "next/image";
import type { Pedido } from "@/types/pedido";

export function ComprobanteViewer({ pedido }: { pedido: Pedido }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
          Comprobante subido
        </p>
        {pedido.comprobanteUrl ? (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-gray-200">
            <Image
              src={pedido.comprobanteUrl}
              alt={`Comprobante de ${pedido.usuarioTiktok}`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sin comprobante</p>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
          Lectura OCR
        </p>
        <pre className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-xs text-gray-700">
          {pedido.ocrTexto || "OCR no procesado todavía."}
        </pre>
      </div>
    </div>
  );
}
