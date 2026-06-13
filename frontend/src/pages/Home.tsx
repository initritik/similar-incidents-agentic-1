import { useEffect, useRef, useCallback } from "react";
import { IncidentSearchForm } from "@/components/forms/IncidentSearchForm";
import { WorkflowDiagram } from "@/components/workflow/WorkflowDiagram";
import { WorkflowSummaryCard } from "@/components/workflow/WorkflowSummaryCard";
import { AgentTabs } from "@/components/workflow/AgentTabs";
import { HistoryPanel } from "@/components/workflow/HistoryPanel";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useWorkflowRunner } from "@/hooks/useWorkflowRunner";
import { useHistory } from "@/hooks/useHistory";
import type { StartWorkflowRequest } from "@/types/workflow";

const EMPTY_AGENT_STATUSES = ["Agent 1","Agent 2","Agent 3","Agent 4","Agent 5"].map((name) => ({
  agent_name: name,
  status: "PENDING" as const,
  current_task: "",
  started_at: null,
  completed_at: null,
  message: "Waiting to start.",
}));

/** Generate a simple unique session ID */
function newSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function Home() {
  const {
    workflow,
    isLoading,
    isStreaming,
    error,
    agentLogs,
    needsResolutionCapture,
    isCaptureLoading,
    run,
    submitResolutionCapture,
    reset,
  } = useWorkflowRunner();

  const { entries, upsertEntry, removeEntry, clearHistory } = useHistory();

  // Stable session ID for the current page load
  const sessionIdRef = useRef<string>(newSessionId());

  // On page load: if the most recent history entry has no final status yet
  // (i.e. the previous session was in-progress or never finished),
  // mark it as stale. A new session ID was already generated above.
  // This gives the "new tab" feel without actually opening a new tab.
  useEffect(() => {
    // Mark any previously PENDING/RUNNING entry as abandoned
    // by giving this session a fresh ID — no extra action needed,
    // the new sessionId means a new history entry will be created.
  }, []);

  // Sync current workflow into history whenever it changes
  useEffect(() => {
    if (!workflow || !workflow.incident_number) return;
    upsertEntry({
      id: sessionIdRef.current,
      incident_number: workflow.incident_number,
      searched_at: workflow.created_at || new Date().toISOString(),
      overall_status: workflow.overall_status ?? null,
    });
  }, [workflow, upsertEntry]);

  // Re-run a historical search — creates a new session so it's tracked separately
  const handleHistorySelect = useCallback(
    (incidentNumber: string) => {
      // Don't re-run if it's already the active workflow
      if (workflow?.incident_number === incidentNumber && !error) return;
      // Fresh session for the re-run
      sessionIdRef.current = newSessionId();
      run({ incident_number: incidentNumber });
    },
    [run, workflow, error]
  );

  // When user resets, prepare a new session ID for the next search
  const handleReset = useCallback(() => {
    sessionIdRef.current = newSessionId();
    reset();
  }, [reset]);

  // When user submits a new search, assign a fresh session ID
  const handleRun = useCallback(
    (payload: StartWorkflowRequest) => {
      sessionIdRef.current = newSessionId();
      run(payload);
    },
    [run]
  );

  const diagramStatuses = workflow?.agent_statuses ?? EMPTY_AGENT_STATUSES;
  const isBusy = isLoading || isStreaming || isCaptureLoading;
  const workflowDone =
    workflow?.overall_status === "COMPLETED" ||
    workflow?.overall_status === "FAILED";

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-5 lg:flex-row lg:items-start">

      {/* LEFT SIDEBAR */}
      <aside className="w-full shrink-0 lg:sticky lg:top-[3.5rem] lg:w-[300px] flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rl-gold/70">
            Incident Search
          </span>
        </div>

        <IncidentSearchForm
          onSubmit={handleRun}
          onReset={handleReset}
          isLoading={isBusy}
          hasResult={!!workflow}
        />

        {error && (
          <div>
            <ErrorState title="Workflow Error" message={error || "An unexpected error occurred"} />
          </div>
        )}

        {/* Resolution capture notice in sidebar */}
        {needsResolutionCapture && workflow && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/80 mb-1">
              Action Required
            </p>
            <p className="text-xs leading-relaxed text-amber-300/70">
              No similar incidents found for{" "}
              <span className="font-mono font-bold text-amber-300">
                {workflow.incident_number}
              </span>
              . Please provide a resolution in the{" "}
              <strong className="text-amber-300">Agent 4</strong> tab.
            </p>
          </div>
        )}

        {/* History panel — replaces Pipeline Overview */}
        <HistoryPanel
          entries={entries}
          onSelect={handleHistorySelect}
          onRemove={removeEntry}
          onClear={clearHistory}
          currentIncidentNumber={workflow?.incident_number ?? null}
        />
      </aside>

      {/* VERTICAL DIVIDER */}
      <div className="hidden w-px self-stretch bg-rl-gold/10 lg:block" aria-hidden />

      {/* RIGHT PANEL */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">

        {/* Section label row */}
        <div className="flex items-center gap-2 px-1">
          <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rl-gold/70">
            Pipeline Status
          </span>
          {isStreaming && workflow && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-rl-gold" role="status" aria-live="polite">
              <span className="size-1.5 animate-pulse rounded-full bg-rl-gold" aria-hidden />
              Live
            </span>
          )}
          {isCaptureLoading && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400" role="status" aria-live="polite">
              <span className="size-1.5 animate-pulse rounded-full bg-amber-400" aria-hidden />
              Saving Resolution…
            </span>
          )}
        </div>

        {/* Workflow Diagram — always shown */}
        <WorkflowDiagram agentStatuses={diagramStatuses} />

        {/* Loading skeleton */}
        {isLoading && !workflow && (
          <div className="space-y-3" aria-busy>
            <div className="h-10 w-full animate-pulse rounded-xl bg-white/5" />
            <div className="h-40 w-full animate-pulse rounded-xl bg-white/5" />
          </div>
        )}

        {/* Empty state — before any workflow runs */}
        {!workflow && !error && !isLoading && (
          <EmptyState
            title="No workflow running"
            description="Enter a 9-character incident identifier in the panel on the left and press Start workflow."
          />
        )}

        {workflow && (workflowDone || needsResolutionCapture) && (
          <div className="space-y-4">
            <WorkflowSummaryCard workflow={workflow} />
            <div className="flex items-center gap-2 px-1 pt-1">
              <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rl-gold/70">
                Agent Results
              </span>
              {needsResolutionCapture && (
                <span className="ml-2 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden />
                  Agent 4 awaiting input
                </span>
              )}
            </div>
            <AgentTabs
              workflow={workflow}
              agentLogs={agentLogs}
              needsResolutionCapture={needsResolutionCapture}
              isCaptureLoading={isCaptureLoading}
              onCaptureSubmit={submitResolutionCapture}
            />
          </div>
        )}
      </div>
    </div>
  );
}