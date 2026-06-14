import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { StatusPill } from "@/components/ui/StatusPill";
import { Agent1Panel } from "@/components/agents/Agent1Panel";
import { Agent2Panel } from "@/components/agents/Agent2Panel";
import { Agent3Panel } from "@/components/agents/Agent3Panel";
import { Agent4Panel } from "@/components/agents/Agent4Panel";
import { Agent5Panel } from "@/components/agents/Agent5Panel";
import { AgentActivityLog } from "@/components/ui/AgentActivityLog";
import type { WorkflowExecution, StartWorkflowRequest } from "@/types/workflow";
import type { AgentLogs } from "@/hooks/useWorkflowRunner";

interface AgentTabsProps {
  workflow: WorkflowExecution;
  agentLogs: AgentLogs;
  needsResolutionCapture?: boolean;
  isCaptureLoading?: boolean;
  onCaptureSubmit?: (payload: StartWorkflowRequest) => void;
}

// Internal agent keys stay the same (matching backend); display names are new
const TAB_KEYS = [
  "Agent 1",
  "Agent 2",
  "Agent 3",
  "Agent 4",
  "Agent 5",
] as const;

type TabKey = (typeof TAB_KEYS)[number];

/** What the tab header shows — no "Agent" keyword */
const TAB_DISPLAY: Record<TabKey, { title: string; subtitle: string }> = {
  "Agent 1": { title: "DATA QUALITY",    subtitle: "Check"             },
  "Agent 2": { title: "KNOWLEDGE",       subtitle: "Base"              },
  "Agent 3": { title: "IMPACT",          subtitle: "Analysis"          },
  "Agent 4": { title: "PROVIDE",         subtitle: "Resolution"        },
  "Agent 5": { title: "RESOLUTION",      subtitle: "Output"            },
};

export function AgentTabs({
  workflow,
  agentLogs,
  needsResolutionCapture,
  isCaptureLoading,
  onCaptureSubmit,
}: AgentTabsProps) {
  const [active, setActive] = useState<TabKey>(
    needsResolutionCapture ? "Agent 4" : "Agent 1",
  );

  useEffect(() => {
    if (needsResolutionCapture) {
      setActive("Agent 4");
    }
  }, [needsResolutionCapture]);

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
          return (
            <Agent4Panel
              agentStatus={agentStatus}
              result={r.agent_4}
              needsResolutionCapture={needsResolutionCapture}
              incidentNumber={workflow.incident_number}
              onCaptureSubmit={onCaptureSubmit}
              isCaptureLoading={isCaptureLoading}
            />
          );
        case "Agent 5":
          return <Agent5Panel agentStatus={agentStatus} result={r.agent_5} />;
      }
    })();

    return (
      <div className="space-y-5">
        <AgentActivityLog logs={logs} currentStatus={agentStatus.status} />
        {(r.agent_1 || r.agent_2 || r.agent_3 || r.agent_4 || r.agent_5 || needsResolutionCapture) && (
          <hr className="border-border" />
        )}
        {panelContent}
      </div>
    );
  }

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Pipeline results"
        className="flex gap-0 overflow-x-auto border-b"
      >
        {TAB_KEYS.map((key, idx) => {
          const agentStatus = statusMap[key];
          const isActive = active === key;
          const isRunning = agentStatus?.status === "RUNNING";
          const awaitingInput = key === "Agent 4" && needsResolutionCapture;
          const { title, subtitle } = TAB_DISPLAY[key];

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
                "group relative flex flex-col items-start gap-0.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[90px]",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
                isRunning && !isActive && "bg-blue-50/50 dark:bg-blue-900/10",
                awaitingInput && !isActive && "bg-amber-50/50 dark:bg-amber-900/10",
                awaitingInput && isActive && "border-amber-400 dark:border-amber-500",
              )}
            >
              {/* Step number */}
              <span className="text-[9px] font-bold text-muted-foreground/50 tracking-widest">
                {String(idx + 1).padStart(2, "0")}
              </span>

              <span className="font-bold text-[11px] tracking-[0.1em]">{title}</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {subtitle}
              </span>

              {awaitingInput && (
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-400">
                  <span className="size-1 rounded-full bg-amber-400 animate-pulse" aria-hidden />
                  Input needed
                </span>
              )}

              {!awaitingInput && agentStatus && (
                <StatusPill status={agentStatus.status} className="text-[10px] mt-0.5" />
              )}

              {isRunning && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-400 animate-pulse"
                  aria-hidden
                />
              )}
              {awaitingInput && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-amber-400 animate-pulse"
                  aria-hidden
                />
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