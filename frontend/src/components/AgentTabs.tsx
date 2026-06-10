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

const TAB_SUBTITLES: Record<TabKey, string> = {
  "Agent 1": "Data Integrity",
  "Agent 2": "Similarity Search",
  "Agent 3": "Incident Analysis",
  "Agent 4": "Resolution Capture",
  "Agent 5": "Recommendation",
};

const TAB_NUMBERS: Record<TabKey, string> = {
  "Agent 1": "01",
  "Agent 2": "02",
  "Agent 3": "03",
  "Agent 4": "04",
  "Agent 5": "05",
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
        <AgentActivityLog logs={logs} currentStatus={agentStatus.status} />

        {(r.agent_1 || r.agent_2 || r.agent_3 || r.agent_4 || r.agent_5) && (
          <hr className="border-border" />
        )}

        {panelContent}
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* ── Tab bar ──────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Agent results"
        className="flex gap-0 overflow-x-auto border-b border-border bg-rl-navy/[0.025]"
      >
        {TAB_KEYS.map((key) => {
          const agentStatus = statusMap[key];
          const isActive = active === key;
          const isRunning = agentStatus?.status === "RUNNING";

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
                "group relative flex flex-col items-start gap-0.5 whitespace-nowrap",
                "border-b-2 px-4 py-3.5 min-w-[96px]",
                "text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rl-gold/40",
                isActive
                  ? "border-rl-gold bg-white dark:bg-card text-rl-navy dark:text-white"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background/60",
                isRunning && !isActive && "bg-rl-gold/5",
              )}
            >
              {/* Step number */}
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-widest",
                  isActive ? "text-rl-gold" : "text-muted-foreground/60",
                )}
              >
                {TAB_NUMBERS[key]}
              </span>
              <span className="text-[11px] font-semibold leading-none">
                {key}
              </span>
              <span className="text-[9px] text-muted-foreground font-normal leading-none mt-0.5">
                {TAB_SUBTITLES[key]}
              </span>

              {agentStatus && (
                <StatusPill status={agentStatus.status} className="text-[9px] mt-1" />
              )}

              {/* Running pulse bar */}
              {isRunning && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-rl-gold animate-pulse"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Panel ────────────────────────────────────────────────── */}
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