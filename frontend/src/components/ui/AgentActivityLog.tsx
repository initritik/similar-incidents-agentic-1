import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import type { WorkflowStatus } from "@/types/workflow";
import type { AgentLogEntry } from "@/hooks/useWorkflowRunner";

const statusDot: Record<WorkflowStatus, string> = {
  PENDING:   "bg-white/20",
  RUNNING:   "bg-rl-gold animate-pulse shadow-[0_0_6px_rgba(201,168,76,0.7)]",
  COMPLETED: "bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.5)]",
  FAILED:    "bg-red-400",
  SKIPPED:   "bg-amber-500/60",
};

const statusLabel: Record<WorkflowStatus, string> = {
  PENDING:   "Pending",
  RUNNING:   "Running…",
  COMPLETED: "Completed",
  FAILED:    "Failed",
  SKIPPED:   "Skipped",
};

const statusText: Record<WorkflowStatus, string> = {
  PENDING:   "text-white/30",
  RUNNING:   "text-rl-gold",
  COMPLETED: "text-blue-400",
  FAILED:    "text-red-400",
  SKIPPED:   "text-amber-400",
};

interface AgentActivityLogProps {
  logs: AgentLogEntry[];
  currentStatus: WorkflowStatus;
  className?: string;
}

export function AgentActivityLog({
  logs,
  currentStatus,
  className,
}: AgentActivityLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

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
            "text-[10px] font-bold uppercase tracking-[0.18em]",
            statusText[currentStatus],
          )}
        >
          {statusLabel[currentStatus]}
        </span>
      </div>

      {/* Activity log entries */}
      {logs.length > 0 && (
        <div className="max-h-52 overflow-y-auto rounded-xl border border-rl-gold/10 bg-rl-deep/60 px-3 py-2 space-y-1.5 text-xs">
          {logs.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 transition-opacity duration-300",
                i === logs.length - 1 ? "opacity-100" : "opacity-50",
              )}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-0.5 shrink-0">
                <span
                  className={cn("size-1.5 rounded-full shrink-0", statusDot[entry.status])}
                  aria-hidden
                />
                {i < logs.length - 1 && (
                  <div className="mt-0.5 w-px flex-1 bg-rl-gold/10" />
                )}
              </div>

              {/* Content */}
              <div className="pb-1.5 min-w-0">
                {entry.current_task && (
                  <p className="font-medium text-white/70 leading-snug">
                    {entry.current_task}
                  </p>
                )}
                {entry.message && entry.message !== entry.current_task && (
                  <p className="text-white/35 leading-snug mt-0.5 text-[10px]">
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
        <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/30">
          <span className="size-1.5 rounded-full bg-rl-gold animate-bounce [animation-delay:0ms]" />
          <span className="size-1.5 rounded-full bg-rl-gold animate-bounce [animation-delay:150ms]" />
          <span className="size-1.5 rounded-full bg-rl-gold animate-bounce [animation-delay:300ms]" />
          <span className="ml-1 text-rl-gold/50 text-[10px] tracking-wider">Starting…</span>
        </div>
      )}
    </div>
  );
}