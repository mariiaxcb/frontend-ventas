import { type LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-brand-dark/50 px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-brand-primary/15 p-4">
        <Icon size={32} className="text-brand-light" />
      </div>
      <h3 className="mb-2 font-poppins text-lg font-semibold text-slate-100">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
