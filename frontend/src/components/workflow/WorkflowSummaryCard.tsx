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

  const firstStarted = workflow.agent_statuses.find((a) => a.started_at);
  const workflowDuration =
    workflow.overall_status === "COMPLETED" ||
    workflow.overall_status === "FAILED"
      ? getDuration(firstStarted?.started_at, lastCompleted?.completed_at)
      : null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2",
        "rounded-lg border border-border bg-card px-4 py-3 shadow-sm",
        "text-sm",
        className,
      )}
    >
      {/* Workflow ID */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Hash className="size-3 text-rl-gold/70" aria-hidden />
        <span className="font-mono text-[11px]">
          {workflow.workflow_id.slice(0, 8)}&hellip;
        </span>
      </div>

      {/* Incident number */}
      <div className="flex items-center gap-1.5">
        <Layers className="size-3 text-rl-gold/70" aria-hidden />
        <span className="font-mono text-[11px] font-semibold text-foreground">
          {workflow.incident_number}
        </span>
      </div>

      {/* Status pill */}
      <StatusPill status={workflow.overall_status} />

      {/* Active agent */}
      {activeAgent && (
        <span className="text-[11px] text-muted-foreground">
          Active:{" "}
          <strong className="font-semibold text-foreground">
            {activeAgent.agent_name}
          </strong>
        </span>
      )}

      {/* Last updated */}
      {lastCompleted?.completed_at && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="size-3" aria-hidden />
          <span>Updated {formatTime(lastCompleted.completed_at)}</span>
        </div>
      )}

      {/* Duration */}
      {workflowDuration !== null && (
        <span className="text-[11px] text-muted-foreground">
          Duration: {formatDuration(workflowDuration)}
        </span>
      )}
    </div>
  );
}