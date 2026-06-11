import { cn } from "@/utils/cn";
import type { WorkflowStatus } from "@/types/workflow";

interface StatusPillProps {
  status: WorkflowStatus;
  className?: string;
}

const config: Record<WorkflowStatus, { label: string; className: string }> = {
  PENDING:   {
    label: "Pending",
    className: "bg-white/5 text-white/40 border border-white/10",
  },
  RUNNING:   {
    label: "Running",
    className: "bg-rl-gold/15 text-rl-gold border border-rl-gold/35",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-900/30 text-blue-300 border border-blue-500/30",
  },
  FAILED:    {
    label: "Failed",
    className: "bg-red-900/30 text-red-300 border border-red-500/30",
  },
  SKIPPED:   {
    label: "Skipped",
    className: "bg-amber-900/20 text-amber-400 border border-amber-500/25",
  },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const { label, className: colorClass } = config[status] ?? config.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-semibold uppercase tracking-wider",
        colorClass,
        className,
      )}
    >
      {status === "RUNNING" && (
        <span
          className="size-1.5 animate-pulse rounded-full bg-rl-gold shadow-[0_0_4px_rgba(201,168,76,0.8)]"
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}