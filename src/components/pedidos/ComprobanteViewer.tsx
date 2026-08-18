import Image from "next/image";
import type { Pedido } from "@/types/pedido";

export function ComprobanteViewer({ pedido }: { pedido: Pedido }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-slate-100 font-inter">
      <div>
        <p className="mb-2 text-xs font-poppins font-medium uppercase tracking-wider text-slate-400">
          Comprobante subido
        </p>
        {pedido.comprobanteUrl ? (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-brand-primary/20 bg-brand-darkest/20">
            <Image
              src={pedido.comprobanteUrl}
              alt={`Comprobante de ${pedido.usuarioTiktok}`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-400">Sin comprobante</p>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-poppins font-medium uppercase tracking-wider text-slate-400">
          Lectura OCR
        </p>
        <pre className="whitespace-pre-wrap rounded-md bg-brand-darkest/50 border border-brand-primary/10 p-3 text-xs text-slate-200 font-mono">
          {pedido.ocrTexto || "OCR no procesado todavía."}
        </pre>
      </div>
    </div>
  );
}
