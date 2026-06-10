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
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center",
        className,
      )}
    >
      <SearchX className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
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
        "flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div>
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="mt-0.5 text-sm text-destructive/80">{message}</p>
      </div>
    </div>
  );
}