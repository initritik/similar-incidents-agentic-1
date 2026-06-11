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

  const completedCount = workflow.agent_statuses.filter(
    (a) => a.status === "COMPLETED",
  ).length;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2",
        "rounded-xl border border-rl-gold/12 bg-rl-navy/50 px-5 py-3.5",
        "shadow-lg shadow-black/30",
        className,
      )}
    >
      {/* Workflow ID */}
      <div className="flex items-center gap-1.5 text-white/40">
        <Hash className="size-3 text-rl-gold/50" aria-hidden />
        <span className="font-mono text-[11px] tracking-wider">
          {workflow.workflow_id.slice(0, 8)}&hellip;
        </span>
      </div>

      {/* Divider */}
      <div className="h-3 w-px bg-rl-gold/15" aria-hidden />

      {/* Incident number */}
      <div className="flex items-center gap-1.5">
        <Layers className="size-3 text-rl-gold/50" aria-hidden />
        <span className="font-mono text-[11px] font-bold text-rl-gold-light tracking-widest">
          {workflow.incident_number}
        </span>
      </div>

      {/* Divider */}
      <div className="h-3 w-px bg-rl-gold/15" aria-hidden />

      {/* Status pill */}
      <StatusPill status={workflow.overall_status} />

      {/* Progress */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-white/40">Progress</span>
        <span className="font-mono text-[11px] font-bold text-white/70">
          {completedCount}/5
        </span>
      </div>

      {/* Active agent */}
      {activeAgent && (
        <span className="text-[11px] text-white/40">
          Active:{" "}
          <strong className="font-semibold text-rl-gold-light">
            {activeAgent.agent_name}
          </strong>
        </span>
      )}

      {/* Last updated */}
      {lastCompleted?.completed_at && (
        <div className="flex items-center gap-1.5 text-[11px] text-white/35">
          <Clock className="size-3" aria-hidden />
          <span>Updated {formatTime(lastCompleted.completed_at)}</span>
        </div>
      )}

      {/* Duration */}
      {workflowDuration !== null && (
        <span className="text-[11px] text-white/35">
          Duration:{" "}
          <span className="text-white/55 font-medium">
            {formatDuration(workflowDuration)}
          </span>
        </span>
      )}
    </div>
  );
}