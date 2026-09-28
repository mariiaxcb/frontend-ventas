import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-brand-primary/10",
        variant === "text" && "h-4 w-full",
        variant === "circular" && "h-10 w-10 rounded-full",
        variant === "rectangular" && "h-24 w-full",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-brand-primary/20 bg-brand-dark p-6">
      <Skeleton variant="text" className="mb-2 h-6 w-3/4" />
      <Skeleton variant="text" className="mb-4 h-4 w-1/2" />
      <Skeleton variant="rectangular" className="h-24 w-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-1/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
          </div>
          <Skeleton variant="text" className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
