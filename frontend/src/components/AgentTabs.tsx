import { useState } from "react";
import { cn } from "@/utils/cn";
import { StatusPill } from "@/components/ui/StatusPill";
import { Agent1Panel } from "@/components/agents/Agent1Panel";
import { Agent2Panel } from "@/components/agents/Agent2Panel";
import { Agent3Panel } from "@/components/agents/Agent3Panel";
import { Agent4Panel } from "@/components/agents/Agent4Panel";
import { Agent5Panel } from "@/components/agents/Agent5Panel";
import { AgentActivityLog } from "@/components/ui/AgentActivityLog";
import type { WorkflowExecution } from "@/types/workflow";
import type { AgentLogs } from "@/hooks/useWorkflowRunner";

interface AgentTabsProps {
  workflow: WorkflowExecution;
  agentLogs: AgentLogs;
}

const TAB_KEYS = [
  "Agent 1",
  "Agent 2",
  "Agent 3",
  "Agent 4",
  "Agent 5",
] as const;

type TabKey = (typeof TAB_KEYS)[number];

const TAB_META: Record<TabKey, { subtitle: string; icon: string }> = {
  "Agent 1": { subtitle: "Data Integrity",    icon: "🔍" },
  "Agent 2": { subtitle: "Similarity Search", icon: "🧠" },
  "Agent 3": { subtitle: "Incident Analysis", icon: "📊" },
  "Agent 4": { subtitle: "Resolution Capture",icon: "💾" },
  "Agent 5": { subtitle: "Recommendation",    icon: "⚡" },
};

export function AgentTabs({ workflow, agentLogs }: AgentTabsProps) {
  const [active, setActive] = useState<TabKey>("Agent 1");

  const statusMap = Object.fromEntries(
    workflow.agent_statuses.map((a) => [a.agent_name, a]),
  );

  const r = workflow.agent_results;

  function renderPanel() {
    const agentStatus = statusMap[active]!;
    const logs = agentLogs[active] ?? [];

    const panelContent = (() => {
      switch (active) {
        case "Agent 1":
          return <Agent1Panel agentStatus={agentStatus} result={r.agent_1} />;
        case "Agent 2":
          return <Agent2Panel agentStatus={agentStatus} result={r.agent_2} />;
        case "Agent 3":
          return <Agent3Panel agentStatus={agentStatus} result={r.agent_3} />;
        case "Agent 4":
          return <Agent4Panel agentStatus={agentStatus} result={r.agent_4} />;
        case "Agent 5":
          return <Agent5Panel agentStatus={agentStatus} result={r.agent_5} />;
      }
    })();

    return (
      <div className="space-y-5">
        {/* Live activity log */}
        <AgentActivityLog
          logs={logs}
          currentStatus={agentStatus.status}
        />

        {/* Divider between live log and structured result */}
        {(r.agent_1 || r.agent_2 || r.agent_3 || r.agent_4 || r.agent_5) && (
          <hr className="border-rl-gold/10" />
        )}

        {panelContent}
      </div>
    );
  }

  return (
    <section className="gold-border-card rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Agent results"
        className="flex gap-0 overflow-x-auto border-b border-rl-gold/10 bg-rl-deep/60"
      >
        {TAB_KEYS.map((key) => {
          const agentStatus = statusMap[key];
          const isActive = active === key;
          const isRunning = agentStatus?.status === "RUNNING";
          const isCompleted = agentStatus?.status === "COMPLETED";
          const meta = TAB_META[key];

          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${key}`}
              id={`tab-${key}`}
              type="button"
              onClick={() => setActive(key)}
              className={cn(
                "group relative flex flex-col items-start gap-1 whitespace-nowrap px-5 py-4 text-sm",
                "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rl-gold min-w-[110px]",
                "border-b-2",
                isActive
                  ? "border-rl-gold bg-rl-navy/40 text-rl-gold-light"
                  : "border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.02]",
              )}
            >
              {/* Icon + label row */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-base transition-all duration-300",
                  isRunning && "agent-icon-float",
                )}>
                  {meta.icon}
                </span>
                <span className="font-semibold text-xs tracking-wide">{key}</span>
              </div>

              <span className={cn(
                "text-[9px] uppercase tracking-widest font-medium leading-none",
                isActive ? "text-rl-gold/60" : "text-white/25",
              )}>
                {meta.subtitle}
              </span>

              {agentStatus && (
                <StatusPill
                  status={agentStatus.status}
                  className="text-[9px] mt-0.5"
                />
              )}

              {/* Running pulse bar */}
              {isRunning && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-rl-gold animate-pulse"
                  aria-hidden
                />
              )}

              {/* Completed indicator */}
              {isCompleted && !isActive && (
                <span className="absolute top-2 right-2 text-[9px] text-blue-400">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="p-6"
      >
        {renderPanel()}
      </div>
    </section>
  );
}