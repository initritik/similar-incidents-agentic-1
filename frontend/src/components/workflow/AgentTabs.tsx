import { useState } from "react";
import { cn } from "@/utils/cn";
import { StatusPill } from "@/components/ui/StatusPill";
import { Agent1Panel } from "@/components/agents/Agent1Panel";
import { Agent2Panel } from "@/components/agents/Agent2Panel";
import { Agent3Panel } from "@/components/agents/Agent3Panel";
import { Agent4Panel } from "@/components/agents/Agent4Panel";
import { Agent5Panel } from "@/components/agents/Agent5Panel";
import type { WorkflowExecution } from "@/types/workflow";

interface AgentTabsProps {
  workflow: WorkflowExecution;
}

const TAB_KEYS = [
  "Agent 1",
  "Agent 2",
  "Agent 3",
  "Agent 4",
  "Agent 5",
] as const;

type TabKey = (typeof TAB_KEYS)[number];

export function AgentTabs({ workflow }: AgentTabsProps) {
  const [active, setActive] = useState<TabKey>("Agent 1");

  const statusMap = Object.fromEntries(
    workflow.agent_statuses.map((a) => [a.agent_name, a]),
  );

  const r = workflow.agent_results;

  function renderPanel() {
    switch (active) {
      case "Agent 1":
        return (
          <Agent1Panel
            agentStatus={statusMap["Agent 1"]!}
            result={r.agent_1}
          />
        );
      case "Agent 2":
        return (
          <Agent2Panel
            agentStatus={statusMap["Agent 2"]!}
            result={r.agent_2}
          />
        );
      case "Agent 3":
        return (
          <Agent3Panel
            agentStatus={statusMap["Agent 3"]!}
            result={r.agent_3}
          />
        );
      case "Agent 4":
        return (
          <Agent4Panel
            agentStatus={statusMap["Agent 4"]!}
            result={r.agent_4}
          />
        );
      case "Agent 5":
        return (
          <Agent5Panel
            agentStatus={statusMap["Agent 5"]!}
            result={r.agent_5}
          />
        );
    }
  }

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Agent results"
        className="flex gap-0 overflow-x-auto border-b"
      >
        {TAB_KEYS.map((key) => {
          const agentStatus = statusMap[key];
          const isActive = active === key;
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
                "group flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {key}
              {agentStatus && (
                <StatusPill
                  status={agentStatus.status}
                  className="text-[10px]"
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