import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import type { WorkflowStatus } from "@/types/workflow";
import type { AgentLogEntry } from "@/hooks/useWorkflowRunner";

const statusDot: Record<WorkflowStatus, string> = {
  PENDING: "bg-muted-foreground/40",
  RUNNING: "bg-blue-500 animate-pulse",
  COMPLETED: "bg-emerald-500",
  FAILED: "bg-red-500",
  SKIPPED: "bg-amber-400",
};

const statusLabel: Record<WorkflowStatus, string> = {
  PENDING: "Pending",
  RUNNING: "Running…",
  COMPLETED: "Completed",
  FAILED: "Failed",
  SKIPPED: "Skipped",
};

const statusText: Record<WorkflowStatus, string> = {
  PENDING: "text-muted-foreground",
  RUNNING: "text-blue-600 dark:text-blue-400",
  COMPLETED: "text-emerald-600 dark:text-emerald-400",
  FAILED: "text-red-600 dark:text-red-400",
  SKIPPED: "text-amber-600 dark:text-amber-400",
};

interface AgentActivityLogProps {
  logs: AgentLogEntry[];
  currentStatus: WorkflowStatus;
  className?: string;
}

/**
 * Displays a live streaming activity log for a single agent.
 * Shows status badge + chronological list of task/message entries.
 */
export function AgentActivityLog({
  logs,
  currentStatus,
  className,
}: AgentActivityLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Current status badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn("size-2 shrink-0 rounded-full", statusDot[currentStatus])}
          aria-hidden
        />
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            statusText[currentStatus],
          )}
        >
          {statusLabel[currentStatus]}
        </span>
      </div>

      {/* Activity log entries */}
      {logs.length > 0 && (
        <div className="max-h-52 overflow-y-auto rounded-lg border bg-muted/30 px-3 py-2 space-y-1.5 text-xs">
          {logs.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 transition-opacity duration-300",
                i === logs.length - 1 ? "opacity-100" : "opacity-70",
              )}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-0.5 shrink-0">
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    statusDot[entry.status],
                  )}
                  aria-hidden
                />
                {i < logs.length - 1 && (
                  <div className="mt-0.5 w-px flex-1 bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="pb-1.5 min-w-0">
                {entry.current_task && (
                  <p className="font-medium text-foreground leading-snug">
                    {entry.current_task}
                  </p>
                )}
                {entry.message && entry.message !== entry.current_task && (
                  <p className="text-muted-foreground leading-snug mt-0.5">
                    {entry.message}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Typing indicator when running but no logs yet */}
      {logs.length === 0 && currentStatus === "RUNNING" && (
        <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
          <span className="size-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
          <span className="size-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
          <span className="ml-1">Starting…</span>
        </div>
      )}
    </div>
  );
}