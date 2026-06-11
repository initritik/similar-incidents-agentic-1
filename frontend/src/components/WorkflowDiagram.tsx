import { cn } from "@/utils/cn";
import type { WorkflowAgentStatus, WorkflowStatus } from "@/types/workflow";

interface WorkflowDiagramProps {
  agentStatuses: WorkflowAgentStatus[];
  className?: string;
}

const AGENTS = [
  {
    name: "Agent 1",
    label: "Data Integrity",
    short: "01",
    icon: "🔍",
    desc: "Validates incident data fields and completeness",
  },
  {
    name: "Agent 2",
    label: "Similarity Search",
    short: "02",
    icon: "🧠",
    desc: "Semantic search across resolved incidents",
  },
  {
    name: "Agent 3",
    label: "Incident Analysis",
    short: "03",
    icon: "📊",
    desc: "Analyses patterns and root causes",
  },
  {
    name: "Agent 4",
    label: "Resolution Capture",
    short: "04",
    icon: "💾",
    desc: "Saves resolution and ingests to vector store",
  },
  {
    name: "Agent 5",
    label: "Recommendation",
    short: "05",
    icon: "⚡",
    desc: "Generates AI-powered resolution recommendation",
  },
];

/** Returns the CSS class(es) for the animated connector line between node[idx] and node[idx+1].
 *  The connector reflects the status of the SOURCE node (left side).
 */
function getConnectorClass(sourceStatus: WorkflowStatus): string {
  switch (sourceStatus) {
    case "RUNNING":
      return "connector-running";
    case "COMPLETED":
      return "connector-completed";
    case "FAILED":
      return "connector-failed";
    default:
      return "connector-pending";
  }
}

function getNodeBorderClass(status: WorkflowStatus): string {
  switch (status) {
    case "RUNNING":
      return "border-rl-gold/80 bg-gradient-to-b from-rl-navy-light/60 to-rl-navy/80 agent-running-glow";
    case "COMPLETED":
      return "border-blue-500/70 bg-gradient-to-b from-blue-900/40 to-rl-navy/80";
    case "FAILED":
      return "border-red-500/70 bg-gradient-to-b from-red-900/30 to-rl-navy/80";
    case "SKIPPED":
      return "border-white/10 bg-rl-navy/40 opacity-40";
    default:
      return "border-white/10 bg-rl-navy/40";
  }
}

function getStatusDotClass(status: WorkflowStatus): string {
  switch (status) {
    case "RUNNING":
      return "bg-rl-gold animate-pulse shadow-[0_0_8px_rgba(201,168,76,0.9)]";
    case "COMPLETED":
      return "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.7)]";
    case "FAILED":
      return "bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.7)]";
    case "SKIPPED":
      return "bg-amber-500/60";
    default:
      return "bg-white/20";
  }
}

function getStepBadgeClass(status: WorkflowStatus): string {
  switch (status) {
    case "RUNNING":
      return "border-rl-gold/70 bg-rl-navy text-rl-gold";
    case "COMPLETED":
      return "border-blue-500/50 bg-blue-900/30 text-blue-300";
    case "FAILED":
      return "border-red-500/50 bg-red-900/30 text-red-300";
    default:
      return "border-white/10 bg-rl-deep/80 text-white/30";
  }
}

export function WorkflowDiagram({
  agentStatuses,
  className,
}: WorkflowDiagramProps) {
  const statusMap = Object.fromEntries(
    agentStatuses.map((a) => [a.agent_name, a]),
  );

  const runningAgent = agentStatuses.find((a) => a.status === "RUNNING");

  return (
    <section
      className={cn(
        "gold-border-card rounded-2xl shadow-2xl shadow-black/40 overflow-hidden",
        className,
      )}
      aria-label="Workflow pipeline diagram"
    >
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-rl-gold/10 bg-rl-deep/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-0.5 rounded-full bg-rl-gold" aria-hidden />
          <h2
            className="text-base font-semibold text-rl-gold-light"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Agent Pipeline
          </h2>
          <span className="text-xs text-white/30 font-light">
            — 5-stage AI workflow
          </span>
        </div>

        {/* Live legend summary */}
        <div className="flex items-center gap-4">
          {(
            [
              ["PENDING",   "Pending",   "bg-white/20"],
              ["RUNNING",   "Running",   "bg-rl-gold animate-pulse"],
              ["COMPLETED", "Completed", "bg-blue-400"],
              ["FAILED",    "Failed",    "bg-red-400"],
              ["SKIPPED",   "Skipped",   "bg-amber-500/60"],
            ] as [WorkflowStatus, string, string][]
          ).map(([s, label, dot]) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={cn("size-1.5 shrink-0 rounded-full", dot)} aria-hidden />
              <span className="text-[10px] text-white/40 tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline nodes */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between w-full overflow-x-auto gap-0">
          {AGENTS.map((agent, idx) => {
            const agentStatus = statusMap[agent.name];
            const status: WorkflowStatus =
              (agentStatus?.status as WorkflowStatus) ?? "PENDING";
            const isLast = idx === AGENTS.length - 1;
            const isRunning = status === "RUNNING";
            const isCompleted = status === "COMPLETED";

            return (
              <div key={agent.name} className="flex items-center flex-1 min-w-0">
                {/* ── Agent Node ─────────────────────────────────────── */}
                <div className="relative flex flex-col items-center group flex-shrink-0">
                  {/* Step badge */}
                  <span
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 z-10",
                      "rounded-full border px-2 py-0.5 text-[9px] font-bold leading-none tracking-widest uppercase",
                      "font-mono",
                      getStepBadgeClass(status),
                    )}
                  >
                    {agent.short}
                  </span>

                  {/* Main node card */}
                  <div
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5",
                      "transition-all duration-500 cursor-default",
                      "w-[110px] text-center",
                      getNodeBorderClass(status),
                    )}
                    aria-label={`${agent.name}: ${status}`}
                  >
                    {/* Bot icon */}
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-2xl",
                        "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10",
                        "shadow-inner transition-all duration-300",
                        isRunning && "agent-icon-float",
                      )}
                    >
                      {agent.icon}
                    </div>

                    {/* Status dot */}
                    <span
                      className={cn(
                        "absolute top-2 right-2 size-2 rounded-full transition-all duration-300",
                        getStatusDotClass(status),
                      )}
                      aria-hidden
                    />

                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[11px] font-bold text-white/90 leading-none tracking-wide">
                        {agent.name}
                      </span>
                      <span className="text-[9px] text-rl-gold/70 font-semibold uppercase tracking-widest leading-tight">
                        {agent.label}
                      </span>
                    </div>

                    {/* Running shimmer bar at bottom */}
                    {isRunning && (
                      <span
                        className="absolute bottom-0 left-0 h-0.5 w-full rounded-b bg-gradient-to-r from-transparent via-rl-gold to-transparent animate-pulse"
                        aria-hidden
                      />
                    )}

                    {/* Completed check */}
                    {isCompleted && (
                      <span className="absolute top-2 left-2 text-[10px] text-blue-400">✓</span>
                    )}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute top-full mt-3 z-20 w-36 rounded-lg border border-rl-gold/15 bg-rl-deep/95 px-3 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl shadow-black/60">
                    <p className="text-[9px] text-white/50 leading-relaxed">{agent.desc}</p>
                  </div>
                </div>

                {/* ── Animated Connector ──────────────────────────────── */}
                {!isLast && (
                  <div className="relative flex flex-1 items-center px-1 min-w-[24px]">
                    <div className="relative flex items-center w-full">
                      {/* Connector line */}
                      <div
                        className={cn(
                          "h-[2px] w-full rounded-full transition-all duration-700",
                          getConnectorClass(status),
                        )}
                        aria-hidden
                      />
                      {/* Arrow tip */}
                      <svg
                        width="7" height="7" viewBox="0 0 7 7"
                        className={cn(
                          "shrink-0 transition-colors duration-500 -ml-px",
                          status === "COMPLETED"
                            ? "text-blue-400"
                            : status === "FAILED"
                            ? "text-red-400"
                            : status === "RUNNING"
                            ? "text-rl-gold"
                            : "text-white/15",
                        )}
                        aria-hidden
                      >
                        <path d="M0 0 L7 3.5 L0 7 Z" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Running agent task preview */}
        {runningAgent?.current_task && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rl-gold/20 bg-rl-gold/5 px-4 py-3 shimmer-bar">
            <span className="mt-0.5 size-2 shrink-0 animate-pulse rounded-full bg-rl-gold shadow-[0_0_8px_rgba(201,168,76,0.7)]" aria-hidden />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-rl-gold/60">
                {runningAgent.agent_name} — Active Task
              </span>
              <p className="text-xs leading-relaxed text-white/70">
                {runningAgent.current_task}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}