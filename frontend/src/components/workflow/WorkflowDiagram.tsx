import { cn } from "@/utils/cn";
import type { WorkflowAgentStatus, WorkflowStatus } from "@/types/workflow";

interface WorkflowDiagramProps {
  agentStatuses: WorkflowAgentStatus[];
  className?: string;
}

const AGENTS = [
  { name: "Agent 1", label: "Data\nIntegrity" },
  { name: "Agent 2", label: "Similarity\nSearch" },
  { name: "Agent 3", label: "Incident\nAnalysis" },
  { name: "Agent 4", label: "Resolution\nCapture" },
  { name: "Agent 5", label: "Recommendation\nGen." },
];

const nodeStyles: Record<WorkflowStatus, string> = {
  PENDING:
    "border-border bg-background text-muted-foreground",
  RUNNING:
    "border-blue-400 bg-blue-50 text-blue-700 shadow-[0_0_0_3px_theme(colors.blue.200)] dark:bg-blue-900/30 dark:text-blue-300 dark:shadow-[0_0_0_3px_theme(colors.blue.800)]",
  COMPLETED:
    "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  FAILED:
    "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  SKIPPED:
    "border-border bg-muted/50 text-muted-foreground opacity-60",
};

const statusDot: Record<WorkflowStatus, string> = {
  PENDING: "bg-muted-foreground/40",
  RUNNING: "bg-blue-500 animate-pulse",
  COMPLETED: "bg-emerald-500",
  FAILED: "bg-red-500",
  SKIPPED: "bg-amber-400",
};

export function WorkflowDiagram({
  agentStatuses,
  className,
}: WorkflowDiagramProps) {
  const statusMap = Object.fromEntries(
    agentStatuses.map((a) => [a.agent_name, a.status]),
  );

  return (
    <section
      className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}
      aria-label="Workflow progress diagram"
    >
      <h2 className="mb-5 text-base font-semibold text-foreground">
        Pipeline
      </h2>

      {/* Horizontal node-connector row */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {AGENTS.map((agent, idx) => {
          const status: WorkflowStatus =
            (statusMap[agent.name] as WorkflowStatus) ?? "PENDING";
          const isLast = idx === AGENTS.length - 1;

          // Agent 4 and 5 are mutually exclusive — show a fork indicator
          const isForkLeft = agent.name === "Agent 4";
          const isForkRight = agent.name === "Agent 5";

          return (
            <div key={agent.name} className="flex items-center">
              {/* Node */}
              <div
                className={cn(
                  "flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 text-center transition-all duration-300",
                  nodeStyles[status],
                )}
                aria-label={`${agent.name}: ${status}`}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    statusDot[status],
                  )}
                  aria-hidden
                />
                <span className="text-xs font-semibold leading-none">
                  {agent.name}
                </span>
                <span className="whitespace-pre-line text-[10px] leading-tight opacity-80">
                  {agent.label}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="relative flex items-center">
                  {/* Fork label between Agent 3 and Agent 4/5 */}
                  {isForkLeft && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-muted-foreground">
                      no match
                    </div>
                  )}
                  <div
                    className={cn(
                      "h-px w-8 transition-colors duration-300",
                      status === "COMPLETED"
                        ? "bg-emerald-400"
                        : status === "FAILED"
                          ? "bg-red-400"
                          : "bg-border",
                    )}
                    aria-hidden
                  />
                  {isForkRight && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-muted-foreground">
                      match found
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4 border-t pt-4">
        {(
          [
            ["PENDING", "Pending"],
            ["RUNNING", "Running"],
            ["COMPLETED", "Completed"],
            ["FAILED", "Failed"],
            ["SKIPPED", "Skipped"],
          ] as [WorkflowStatus, string][]
        ).map(([s, label]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className={cn("size-2 rounded-full", statusDot[s])}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}