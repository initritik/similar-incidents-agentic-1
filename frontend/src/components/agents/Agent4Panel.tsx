import { CheckCircle2, XCircle, Database, Save, SkipForward, ShieldCheck } from "lucide-react";
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
  // ── Waiting for user to provide resolution (new incident path) ────────────
  // Check this BEFORE the SKIPPED guard — when Agent 4 is SKIPPED with an
  // "awaiting user input" message, needsResolutionCapture will be true and we
  // must show the form instead of the generic "skipped" UI.
  //
  // Also show the form (in its resolved-confirmation state) immediately after
  // Agent 4 completes successfully so the user sees the RESOLVED feedback
  // without having to switch tabs.
  if (needsResolutionCapture && incidentNumber && onCaptureSubmit) {
    return (
      <ResolutionCaptureForm
        incidentNumber={incidentNumber}
        onSubmit={onCaptureSubmit}
        isLoading={isCaptureLoading ?? false}
        agent4Result={result}
      />
    );
  }

  // After a successful Agent 4 capture (re-run completed), show the resolved
  // confirmation view even if needsResolutionCapture has been flipped back.
  if (
    agentStatus.status === "COMPLETED" &&
    result?.saved === true &&
    incidentNumber &&
    onCaptureSubmit
  ) {
    return (
      <ResolutionCaptureForm
        incidentNumber={incidentNumber}
        onSubmit={onCaptureSubmit}
        isLoading={false}
        agent4Result={result}
      />
    );
  }

  // ── Skipped: similar incidents found → Agent 5 handles recommendation ────
  if (agentStatus.status === "SKIPPED") {
    const wasResolutionCaptured =
      result?.saved === true ||
      agentStatus.message?.toLowerCase().includes("resolution captured");

    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
        <SkipForward className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">Agent 4 skipped</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          {wasResolutionCaptured
            ? "Resolution was already captured. No further action needed."
            : "Similar incident(s) found — Agent 5 will generate the recommended resolution."}
        </p>
      </div>
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
        <CheckRow
          label="Incident state → RESOLVED"
          ok={result.incident_state_updated ?? false}
          value={
            result.incident_state_updated
              ? result.saved_incident_number ?? undefined
              : undefined
          }
        />
      </div>

      {/* RESOLVED badge */}
      {result.incident_state_updated && (
        <div className="flex items-center gap-3 rounded-md border border-emerald-500/25 bg-emerald-500/8 px-4 py-3">
          <ShieldCheck className="size-4 text-emerald-400 shrink-0" aria-hidden />
          <p className="text-xs text-emerald-300">
            Incident{" "}
            <span className="font-mono font-semibold">
              {result.saved_incident_number}
            </span>{" "}
            has been transitioned to{" "}
            <span className="font-semibold text-emerald-400">RESOLVED</span> in
            the mock data store.
          </p>
        </div>
      )}

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