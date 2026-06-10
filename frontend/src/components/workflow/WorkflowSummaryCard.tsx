import { Clock, Hash, Layers } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatTime, getDuration, formatDuration } from "@/utils/dateUtils";
import { cn } from "@/utils/cn";
import type { WorkflowExecution } from "@/types/workflow";

interface WorkflowSummaryCardProps {
  workflow: WorkflowExecution;
  className?: string;
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

  // Calculate total workflow duration if workflow is complete
  const firstStarted = workflow.agent_statuses.find((a) => a.started_at);
  const workflowDuration =
    workflow.overall_status === "COMPLETED" ||
    workflow.overall_status === "FAILED"
      ? getDuration(firstStarted?.started_at, lastCompleted?.completed_at)
      : null;

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
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          <span>Updated {formatTime(lastCompleted.completed_at)}</span>
        </div>
      )}

      {workflowDuration !== null && (
        <span className="text-xs text-muted-foreground">
          Duration: {formatDuration(workflowDuration)}
        </span>
      )}
    </div>
  );
}