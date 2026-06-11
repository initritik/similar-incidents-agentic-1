import { AlertCircle, SearchX } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-rl-gold/15 bg-rl-navy/20 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rl-gold/15 bg-rl-navy/40 shadow-inner">
        <SearchX className="size-7 text-rl-gold/30" aria-hidden />
      </div>
      <div className="space-y-1.5">
        <p
          className="text-sm font-semibold text-white/60"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </p>
        {description && (
          <p className="max-w-sm text-xs leading-relaxed text-white/30">{description}</p>
        )}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-red-500/25 bg-red-900/15 px-4 py-3.5 shadow-lg shadow-red-900/10",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-red-300">{title}</p>
        <p className="mt-0.5 text-xs text-red-400/70">{message}</p>
      </div>
    </div>
  );
}