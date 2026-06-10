import { cn } from "@/utils/cn";
import type { WorkflowStatus } from "@/types/workflow";

interface StatusPillProps {
  status: WorkflowStatus;
  className?: string;
}

const config: Record<
  WorkflowStatus,
  { label: string; className: string }
> = {
  PENDING:   { label: "Pending",    className: "bg-muted text-muted-foreground" },
  RUNNING:   { label: "Running",    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  COMPLETED: { label: "Completed",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  FAILED:    { label: "Failed",     className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  SKIPPED:   { label: "Skipped",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const { label, className: colorClass } = config[status] ?? config.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className,
      )}
    >
      {status === "RUNNING" && (
        <span className="size-1.5 animate-pulse rounded-full bg-blue-500" aria-hidden />
      )}
      {label}
    </span>
  );
}