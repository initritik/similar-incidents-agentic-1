import type { WorkflowStatus, WorkflowAgentStatus } from "@/types/workflow";

export interface UINodeMetadata {
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  dotColor: string;
}

/**
 * Maps any internal WorkflowStatus string onto clear, design-compliant theme colors.
 */
export function getWorkflowStatusTheme(status: WorkflowStatus): UINodeMetadata {
  switch (status) {
    case "RUNNING":
      return {
        borderColor: "border-blue-400",
        backgroundColor: "bg-blue-50 dark:bg-blue-900/30",
        textColor: "text-blue-700 dark:text-blue-300",
        dotColor: "bg-blue-500 animate-pulse",
      };
    case "COMPLETED":
      return {
        borderColor: "border-emerald-400",
        backgroundColor: "bg-emerald-50 dark:bg-emerald-900/30",
        textColor: "text-emerald-700 dark:text-emerald-300",
        dotColor: "bg-emerald-500",
      };
    case "FAILED":
      return {
        borderColor: "border-red-400",
        backgroundColor: "bg-red-50 dark:bg-red-900/30",
        textColor: "text-red-700 dark:text-red-300",
        dotColor: "bg-red-500",
      };
    case "SKIPPED":
      return {
        borderColor: "border-border",
        backgroundColor: "bg-muted/50",
        textColor: "text-muted-foreground opacity-60",
        dotColor: "bg-amber-400",
      };
    case "PENDING":
    default:
      return {
        borderColor: "border-border",
        backgroundColor: "bg-background",
        textColor: "text-muted-foreground",
        dotColor: "bg-muted-foreground/40",
      };
  }
}

/**
 * Prepares workflow agent statuses safely with structural fallbacks.
 * Ensures partial execution contexts are fully preserved even if upstream steps crash.
 */
export function safelyMapAgentStatuses(
  statuses: WorkflowAgentStatus[] | undefined
): WorkflowAgentStatus[] {
  if (!statuses || !Array.isArray(statuses)) {
    return [];
  }
  return statuses.map((agent) => ({
    agent_name: agent.agent_name ?? "Unknown Agent",
    status: agent.status ?? "PENDING",
    current_task: agent.current_task ?? "",
    started_at: agent.started_at ?? null,
    completed_at: agent.completed_at ?? null,
    message: agent.message ?? "No status context supplied.",
  }));
}