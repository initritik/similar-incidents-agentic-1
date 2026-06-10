import { cn } from "@/utils/cn";
import type { WorkflowStatus } from "@/types/workflow";

interface StatusPillProps {
  status: WorkflowStatus;
  className?: string;
}

const config: Record<WorkflowStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "bg-muted text-muted-foreground border border-border" },
  RUNNING:   { label: "Running",   className: "bg-rl-gold/10 text-rl-navy border border-rl-gold/40 dark:bg-rl-gold/20 dark:text-rl-gold" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
  FAILED:    { label: "Failed",    className: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },
  SKIPPED:   { label: "Skipped",   className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const { label, className: colorClass } = config[status] ?? config.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-semibold",
        colorClass,
        className,
      )}
    >
      {status === "RUNNING" && (
        <span className="size-1.5 animate-pulse rounded-full bg-rl-gold" aria-hidden />
      )}
      {label}
    </span>
  );
}