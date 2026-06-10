import { cn } from "@/utils/cn";
import type { WorkflowAgentStatus, WorkflowStatus } from "@/types/workflow";

interface WorkflowDiagramProps {
  agentStatuses: WorkflowAgentStatus[];
  className?: string;
}

const AGENTS = [
  { name: "Agent 1", label: "Data Integrity",     short: "01" },
  { name: "Agent 2", label: "Similarity Search",  short: "02" },
  { name: "Agent 3", label: "Incident Analysis",  short: "03" },
  { name: "Agent 4", label: "Resolution Capture", short: "04" },
  { name: "Agent 5", label: "Recommendation",     short: "05" },
];

/* Per-status ring/bg/text treatments — Royal London palette */
const nodeStyles: Record<WorkflowStatus, string> = {
  PENDING:
    "border-border bg-card text-muted-foreground",
  RUNNING:
    "border-rl-gold bg-rl-navy text-white rl-running-ring",
  COMPLETED:
    "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  FAILED:
    "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  SKIPPED:
    "border-border bg-muted/50 text-muted-foreground opacity-50",
};

const dotStyles: Record<WorkflowStatus, string> = {
  PENDING:   "bg-muted-foreground/40",
  RUNNING:   "bg-rl-gold animate-pulse",
  COMPLETED: "bg-emerald-500",
  FAILED:    "bg-red-500",
  SKIPPED:   "bg-amber-400",
};

const connectorStyles: Record<WorkflowStatus, string> = {
  PENDING:   "bg-border",
  RUNNING:   "bg-rl-gold/50",
  COMPLETED: "bg-emerald-400",
  FAILED:    "bg-red-400",
  SKIPPED:   "bg-border",
};

export function WorkflowDiagram({
  agentStatuses,
  className,
}: WorkflowDiagramProps) {
  const statusMap = Object.fromEntries(
    agentStatuses.map((a) => [a.agent_name, a]),
  );

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm overflow-hidden",
        className,
      )}
      aria-label="Workflow pipeline diagram"
    >
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-border bg-rl-navy/[0.03] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">
            Agent Pipeline
          </h2>
        </div>

        {/* Live legend summary — compact */}
        <div className="flex items-center gap-3">
          {(
            [
              ["PENDING",   "Pending",   "bg-muted-foreground/40"],
              ["RUNNING",   "Running",   "bg-rl-gold animate-pulse"],
              ["COMPLETED", "Completed", "bg-emerald-500"],
              ["FAILED",    "Failed",    "bg-red-500"],
              ["SKIPPED",   "Skipped",   "bg-amber-400"],
            ] as [WorkflowStatus, string, string][]
          ).map(([s, label, dot]) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={cn("size-1.5 shrink-0 rounded-full", dot)} aria-hidden />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline nodes — horizontal scrollable row */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-0 overflow-x-auto">
          {AGENTS.map((agent, idx) => {
            const agentStatus = statusMap[agent.name];
            const status: WorkflowStatus =
              (agentStatus?.status as WorkflowStatus) ?? "PENDING";
            const isLast = idx === AGENTS.length - 1;

            /* Fork annotations between Agent 3→4 and 3→5 */
            const isForkLeft  = agent.name === "Agent 4";
            const isForkRight = agent.name === "Agent 5";

            return (
              <div key={agent.name} className="flex items-center">
                {/* ── Agent node ─────────────────────────────────────── */}
                <div
                  className={cn(
                    "relative flex w-[88px] shrink-0 flex-col items-center gap-1.5",
                    "rounded-lg border-2 px-2 py-3 text-center",
                    "transition-all duration-300",
                    nodeStyles[status],
                  )}
                  aria-label={`${agent.name}: ${status}`}
                >
                  {/* Step number */}
                  <span
                    className={cn(
                      "absolute -top-2.5 left-1/2 -translate-x-1/2",
                      "rounded-full border px-1.5 py-px text-[9px] font-bold leading-none tracking-wide",
                      status === "RUNNING"
                        ? "border-rl-gold bg-rl-navy text-rl-gold"
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {agent.short}
                  </span>

                  {/* Status dot */}
                  <span
                    className={cn("size-2 rounded-full", dotStyles[status])}
                    aria-hidden
                  />

                  <span className="text-[11px] font-bold leading-none">
                    {agent.name}
                  </span>
                  <span className="text-[9px] leading-snug opacity-75">
                    {agent.label}
                  </span>

                  {/* Running shimmer bar */}
                  {status === "RUNNING" && (
                    <span
                      className="absolute bottom-0 left-0 h-0.5 w-full rounded-b bg-rl-gold animate-pulse"
                      aria-hidden
                    />
                  )}
                </div>

                {/* ── Connector ─────────────────────────────────────── */}
                {!isLast && (
                  <div className="relative flex shrink-0 items-center">
                    {isForkLeft && (
                      <span className="absolute -top-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-amber-600">
                        no match
                      </span>
                    )}
                    {isForkRight && (
                      <span className="absolute -top-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-emerald-600">
                        match found
                      </span>
                    )}
                    <div
                      className={cn(
                        "h-px w-7 transition-colors duration-500",
                        connectorStyles[status],
                      )}
                      aria-hidden
                    />
                    {/* Arrow tip */}
                    <svg
                      width="6" height="6" viewBox="0 0 6 6"
                      className={cn(
                        "shrink-0 transition-colors duration-500",
                        status === "COMPLETED"
                          ? "text-emerald-400"
                          : status === "FAILED"
                          ? "text-red-400"
                          : status === "RUNNING"
                          ? "text-rl-gold/50"
                          : "text-border",
                      )}
                      aria-hidden
                    >
                      <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Running agent task preview */}
        {agentStatuses.some((a) => a.status === "RUNNING" && a.current_task) && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rl-gold/30 bg-rl-gold/5 px-3.5 py-2.5">
            <span className="mt-0.5 size-1.5 shrink-0 animate-pulse rounded-full bg-rl-gold" aria-hidden />
            <p className="text-[11px] leading-relaxed text-foreground/80">
              {agentStatuses.find((a) => a.status === "RUNNING")?.current_task}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}