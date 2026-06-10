import { Clock, Hash, Layers } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/utils/cn";
import type { WorkflowExecution } from "@/types/workflow";

interface WorkflowSummaryCardProps {
  workflow: WorkflowExecution;
  className?: string;
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function WorkflowSummaryCard({
  workflow,
  className,
}: WorkflowSummaryCardProps) {
  const activeAgent = workflow.agent_statuses.find(
    (a) => a.status === "RUNNING",
  );
  const lastCompleted = [...workflow.agent_statuses]
    .reverse()
    .find((a) => a.completed_at);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-card px-5 py-3 text-sm shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Hash className="size-3.5" aria-hidden />
        <span className="font-mono text-xs">{workflow.workflow_id.slice(0, 8)}&hellip;</span>
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Layers className="size-3.5" aria-hidden />
        <span className="font-mono text-xs font-medium text-foreground">
          {workflow.incident_number}
        </span>
      </div>

      <StatusPill status={workflow.overall_status} />

      {activeAgent && (
        <span className="text-xs text-muted-foreground">
          Active: <strong className="text-foreground">{activeAgent.agent_name}</strong>
        </span>
      )}

      {lastCompleted?.completed_at && (
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          <span>Updated {fmt(lastCompleted.completed_at)}</span>
        </div>
      )}
    </div>
  );
}