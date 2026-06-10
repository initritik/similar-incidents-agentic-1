import { CheckCircle2, XCircle } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/States";
import { cn } from "@/utils/cn";
import type { Agent1Response, WorkflowAgentStatus } from "@/types/workflow";

interface Agent1PanelProps {
  agentStatus: WorkflowAgentStatus;
  result: Agent1Response | undefined;
}

function IncidentDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b py-2 last:border-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}

export function Agent1Panel({ agentStatus, result }: Agent1PanelProps) {
  if (agentStatus.status === "PENDING" || agentStatus.status === "SKIPPED") {
    return (
      <EmptyState
        title={agentStatus.status === "SKIPPED" ? "Agent 1 skipped" : "Agent 1 pending"}
        description={agentStatus.message}
      />
    );
  }

  if (!result) {
    return (
      <EmptyState title="No result available" description="Agent 1 has not produced output yet." />
    );
  }

  const { incident, missing_fields } = result;

  return (
    <div className="space-y-5">
      {/* Status row */}
      <div className="flex items-center gap-3">
        {result.success ? (
          <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />
        ) : (
          <XCircle className="size-5 text-destructive" aria-hidden />
        )}
        <p className="text-sm font-medium text-foreground">{result.message}</p>
        <StatusPill status={agentStatus.status} className="ml-auto" />
      </div>

      {/* Missing fields */}
      {missing_fields.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Missing fields
          </p>
          <ul className="mt-1 list-inside list-disc">
            {missing_fields.map((f) => (
              <li key={f} className="text-xs text-amber-600 dark:text-amber-500">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Incident details */}
      {incident && (
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Incident details
          </h3>
          <div>
            <IncidentDetailRow label="Number" value={incident.incident_number} />
            <IncidentDetailRow label="State" value={incident.state} />
            <IncidentDetailRow label="Short description" value={incident.short_description} />
            <IncidentDetailRow label="Assignment group" value={incident.assignment_group} />
            <IncidentDetailRow label="Assigned to" value={incident.assigned_to} />
            {incident.resolution_notes && (
              <IncidentDetailRow label="Resolution notes" value={incident.resolution_notes} />
            )}
            <IncidentDetailRow
              label="Description"
              value={incident.description}
            />
          </div>
        </div>
      )}
    </div>
  );
}