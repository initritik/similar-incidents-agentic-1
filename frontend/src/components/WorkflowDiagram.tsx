import { cn } from "@/utils/cn";
import type { WorkflowAgentStatus, WorkflowStatus } from "@/types/workflow";

interface WorkflowDiagramProps {
  agentStatuses: WorkflowAgentStatus[];
  className?: string;
}

const AGENTS = [
  { name: "Agent 1", label: "Data\nIntegrity",     icon: "🔍" },
  { name: "Agent 2", label: "Similarity\nSearch",  icon: "🧠" },
  { name: "Agent 3", label: "Incident\nAnalysis",  icon: "📊" },
  { name: "Agent 4", label: "Resolution\nCapture", icon: "💾" },
  { name: "Agent 5", label: "Recommendation\nGen.",icon: "⚡" },
];

const nodeStyles: Record<WorkflowStatus, string> = {
  PENDING:   "border-white/10 bg-[#0E1E3A] text-white/40",
  RUNNING:   "border-rl-gold/80 bg-[#1A2F50] text-white rl-running-ring",
  COMPLETED: "border-blue-500/60 bg-blue-900/30 text-blue-200",
  FAILED:    "border-red-500/60 bg-red-900/30 text-red-300",
  SKIPPED:   "border-white/10 bg-[#0E1E3A]/50 text-white/25 opacity-50",
};

const statusDot: Record<WorkflowStatus, string> = {
  PENDING:   "bg-white/20",
  RUNNING:   "bg-rl-gold animate-pulse shadow-[0_0_8px_rgba(201,168,76,0.9)]",
  COMPLETED: "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]",
  FAILED:    "bg-red-400",
  SKIPPED:   "bg-amber-500/50",
};

function connectorClass(status: WorkflowStatus): string {
  switch (status) {
    case "RUNNING":   return "connector-running";
    case "COMPLETED": return "connector-completed";
    case "FAILED":    return "connector-failed";
    default:          return "connector-pending";
  }
}

export function WorkflowDiagram({ agentStatuses, className }: WorkflowDiagramProps) {
  const statusMap = Object.fromEntries(
    agentStatuses.map((a) => [a.agent_name, a]),
  );
  const runningAgent = agentStatuses.find((a) => a.status === "RUNNING");

  return (
    <section
      className={cn("gold-border-card rounded-2xl shadow-2xl shadow-black/40 overflow-hidden", className)}
      aria-label="Workflow pipeline diagram"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rl-gold/10 bg-[#070F1E]/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-0.5 rounded-full bg-rl-gold" />
          <h2 className="text-base font-semibold text-rl-gold-light" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Agent Pipeline
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {(["PENDING","RUNNING","COMPLETED","FAILED","SKIPPED"] as WorkflowStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", statusDot[s])} />
              <span className="text-[10px] text-white/35 capitalize">{s.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline row */}
      <div className="px-6 py-8">
        {/* Use a table-like approach: fixed node widths, flexible connector widths */}
        <div className="flex items-center w-full">
          {AGENTS.map((agent, idx) => {
            const agentStatus = statusMap[agent.name];
            const status: WorkflowStatus = (agentStatus?.status as WorkflowStatus) ?? "PENDING";
            const isLast = idx === AGENTS.length - 1;

            return (
              <div key={agent.name} className={cn("flex items-center", isLast ? "flex-none" : "flex-1")}>
                {/* Node */}
                <div className="relative flex flex-col items-center group flex-none">
                  {/* Step badge */}
                  <span className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-full border px-1.5 py-px text-[9px] font-bold font-mono tracking-widest",
                    status === "RUNNING"
                      ? "border-rl-gold/70 bg-[#0C1F3F] text-rl-gold"
                      : status === "COMPLETED"
                      ? "border-blue-500/50 bg-blue-900/30 text-blue-300"
                      : "border-white/10 bg-[#070F1E] text-white/25",
                  )}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Card */}
                  <div
                    className={cn(
                      "relative flex w-[100px] flex-col items-center gap-2 rounded-xl border-2 px-2 py-4 text-center transition-all duration-500",
                      nodeStyles[status],
                    )}
                    aria-label={`${agent.name}: ${status}`}
                  >
                    {/* Status dot top-right */}
                    <span className={cn("absolute top-2 right-2 size-2 rounded-full", statusDot[status])} aria-hidden />

                    {/* Icon */}
                    <div className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl text-xl",
                      "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-inner",
                      status === "RUNNING" && "animate-[float_3s_ease-in-out_infinite]",
                    )}>
                      {agent.icon}
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[11px] font-bold leading-none tracking-wide">{agent.name}</span>
                      <span className="whitespace-pre-line text-[9px] leading-tight text-rl-gold/60 font-semibold uppercase tracking-widest">
                        {agent.label}
                      </span>
                    </div>

                    {/* Running shimmer */}
                    {status === "RUNNING" && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-b bg-gradient-to-r from-transparent via-rl-gold to-transparent animate-pulse" />
                    )}
                    {/* Completed tick */}
                    {status === "COMPLETED" && (
                      <span className="absolute top-2 left-2 text-[9px] text-blue-400">✓</span>
                    )}
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute top-full mt-2 z-20 w-32 rounded-lg border border-rl-gold/15 bg-[#070F1E]/95 px-2.5 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl shadow-black/60">
                    <p className="text-[9px] text-white/40 leading-relaxed">{agentStatus?.current_task || agent.name}</p>
                  </div>
                </div>

                {/* Connector — takes up all remaining flex space between nodes */}
                {!isLast && (
                  <div className="relative flex flex-1 items-center px-2 min-w-[40px]">
                    <div className={cn("h-[2px] w-full rounded-full transition-all duration-700", connectorClass(status))} />
                    <svg width="7" height="7" viewBox="0 0 7 7" className={cn(
                      "shrink-0 -ml-px transition-colors duration-500",
                      status === "COMPLETED" ? "text-blue-400"
                      : status === "RUNNING"  ? "text-rl-gold"
                      : status === "FAILED"   ? "text-red-400"
                      : "text-white/12",
                    )}>
                      <path d="M0 0 L7 3.5 L0 7 Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Running task banner */}
        {runningAgent?.current_task && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rl-gold/20 bg-rl-gold/5 px-4 py-3">
            <span className="mt-0.5 size-2 shrink-0 animate-pulse rounded-full bg-rl-gold shadow-[0_0_8px_rgba(201,168,76,0.7)]" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-rl-gold/60">
                {runningAgent.agent_name} — Active
              </span>
              <p className="text-xs leading-relaxed text-white/60">{runningAgent.current_task}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}