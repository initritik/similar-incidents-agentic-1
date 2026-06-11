import { CheckCircle2, XCircle, Database, Save, SkipForward } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ResolutionCaptureForm } from "@/components/forms/ResolutionCaptureForm";
import type { Agent4Response, WorkflowAgentStatus, StartWorkflowRequest } from "@/types/workflow";

interface Agent4PanelProps {
  agentStatus: WorkflowAgentStatus;
  result: Agent4Response | undefined;
  /** Present only when Agent 4 is awaiting resolution input from the user */
  needsResolutionCapture?: boolean;
  incidentNumber?: string;
  onCaptureSubmit?: (payload: StartWorkflowRequest) => void;
  isCaptureLoading?: boolean;
}

function CheckRow({
  label,
  ok,
  value,
}: {
  label: string;
  ok: boolean;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b py-3 last:border-0">
      {ok ? (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
      ) : (
        <XCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <span className="text-sm text-foreground">{label}</span>
      {value && (
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {value}
        </span>
      )}
    </div>
  );
}

export function Agent4Panel({
  agentStatus,
  result,
  needsResolutionCapture,
  incidentNumber,
  onCaptureSubmit,
  isCaptureLoading,
}: Agent4PanelProps) {
  // ── Skipped: similar incidents found, Agent 5 handles it ─────────────────
  if (agentStatus.status === "SKIPPED") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
        <SkipForward className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">Agent 4 skipped</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Similar incident(s) found — Agent 5 will generate the recommended resolution.
        </p>
      </div>
    );
  }

  // ── Waiting for user to provide resolution (new incident path) ────────────
  if (needsResolutionCapture && incidentNumber && onCaptureSubmit) {
    return (
      <ResolutionCaptureForm
        incidentNumber={incidentNumber}
        onSubmit={onCaptureSubmit}
        isLoading={isCaptureLoading ?? false}
      />
    );
  }

  // ── Pending ────────────────────────────────────────────────────────────────
  if (agentStatus.status === "PENDING") {
    return (
      <EmptyState title="Agent 4 pending" description={agentStatus.message} />
    );
  }

  // ── No result yet ──────────────────────────────────────────────────────────
  if (!result) {
    return (
      <EmptyState title="No result available" description="Agent 4 has not produced output yet." />
    );
  }

  // ── Completed result ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Status row */}
      <div className="flex items-center gap-3">
        {result.success ? (
          <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />
        ) : (
          <XCircle className="size-5 text-destructive" aria-hidden />
        )}
        <p className="text-sm font-medium">{result.message}</p>
        <StatusPill status={agentStatus.status} className="ml-auto" />
      </div>

      {result.error && <ErrorState message={result.error} />}

      {/* Checklist */}
      <div className="rounded-lg border bg-background px-4">
        <CheckRow
          label="Resolution saved"
          ok={result.saved}
          value={result.saved_incident_number ?? undefined}
        />
        <CheckRow label="Ingested to Qdrant" ok={result.ingested_to_qdrant} />
        <CheckRow label="Datafix saved" ok={result.datafix_saved} />
      </div>

      {result.saved_incident_number && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-4 py-3">
          <Save className="size-4 text-muted-foreground" aria-hidden />
          <p className="text-xs text-muted-foreground">
            Saved as{" "}
            <span className="font-mono font-medium text-foreground">
              {result.saved_incident_number}
            </span>{" "}
            and indexed for future similarity searches.
          </p>
        </div>
      )}

      {result.ingested_to_qdrant && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-4 py-3">
          <Database className="size-4 text-muted-foreground" aria-hidden />
          <p className="text-xs text-muted-foreground">
            Resolution ingested into Qdrant vector store successfully.
          </p>
        </div>
      )}
    </div>
  );
}