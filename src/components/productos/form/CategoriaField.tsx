import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField, FIELD_CLASS } from "./FormField";

interface CategoriaFieldProps {
  value: string;
  onChange: (valor: string) => void;
  categorias: any[];
  cargando?: boolean;
  /** Muestra el botón para escribir una categoría nueva. */
  permitirNueva?: boolean;
}

const nombreDe = (cat: any): string =>
  typeof cat === "string" ? cat : cat.name || cat.nombre || "";

export function CategoriaField({
  value,
  onChange,
  categorias,
  cargando,
  permitirNueva = false,
}: CategoriaFieldProps) {
  const [esNueva, setEsNueva] = useState(false);

  const alternar = () => {
    setEsNueva((prev) => !prev);
    onChange("");
  };

  return (
    <FormField label={esNueva ? "Escribir Nueva Categoría" : "Categoría"}>
      <div className="flex gap-2">
        {esNueva ? (
          <Input
            placeholder="Ej. Periféricos"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
          />
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            className={FIELD_CLASS}
          >
            <option value="" disabled>
              {cargando ? "Cargando categorías..." : "Selecciona una categoría"}
            </option>
            {categorias.map((cat) => {
              const nombre = nombreDe(cat);
              return (
                <option key={cat.id ?? nombre} value={nombre}>
                  {nombre}
                </option>
              );
            })}
          </select>
        )}

        {permitirNueva && (
          <Button
            type="button"
            variant="outline"
            onClick={alternar}
            title={esNueva ? "Seleccionar existente" : "Agregar nueva categoría"}
            className="flex-shrink-0 px-3"
          >
            {esNueva ? <X size={18} /> : <Plus size={18} />}
          </Button>
        )}
      </div>
    </FormField>
  );
}