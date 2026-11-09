"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface ImagenFieldProps {
  value: File | null;
  /** Imagen ya guardada (al editar). */
  currentUrl?: string | null;
  onChange: (file: File | null) => void;
}

export function ImagenField({ value, currentUrl, onChange }: ImagenFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const preview = objectUrl ?? currentUrl ?? null;
  const abrir = () => inputRef.current?.click();

  const quitar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={abrir}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && abrir()}
        className="group relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-surface-border bg-brand-darkest/60 transition-all hover:border-brand-cyan hover:bg-brand-raised"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Previsualización"
              className="h-full w-full object-contain p-2"
            />
            <span className="absolute inset-x-0 bottom-0 bg-brand-darkest/70 py-1 text-center text-[10px] text-slate-200 opacity-0 transition-opacity group-hover:opacity-100">
              Cambiar imagen
            </span>
            {objectUrl && (
              <button
                type="button"
                onClick={quitar}
                aria-label="Quitar imagen seleccionada"
                className="absolute right-2 top-2 rounded-full bg-estado-rechazado/80 p-1 text-slate-100 transition-colors hover:bg-estado-rechazado"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 transition-colors group-hover:text-brand-cyan">
            <Upload size={28} />
            <span className="text-xs font-medium">Haz clic para subir una imagen</span>
            <span className="text-[10px] text-slate-500">PNG, JPG, WEBP, SVG</span>
          </div>
        )}
      </div>
    </>
  );
}