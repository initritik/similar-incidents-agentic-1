import { useEffect, useRef, useCallback, useState } from "react";
import { IncidentSearchForm } from "@/components/forms/IncidentSearchForm";
import { WorkflowDiagram } from "@/components/workflow/WorkflowDiagram";
import { WorkflowSummaryCard } from "@/components/workflow/WorkflowSummaryCard";
import { AgentTabs } from "@/components/workflow/AgentTabs";
import { HistoryPanel } from "@/components/workflow/HistoryPanel";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useWorkflowRunner } from "@/hooks/useWorkflowRunner";
import { useHistory } from "@/hooks/useHistory";
import type { HistoryEntry } from "@/hooks/useHistory";
import type { StartWorkflowRequest, WorkflowExecution } from "@/types/workflow";
import type { AgentLogs } from "@/hooks/useWorkflowRunner";

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

  // ── Historical snapshot view ──────────────────────────────────────────────
  // When user clicks a history entry we restore its snapshot instead of re-running.
  // isViewingHistory=true means we're showing a frozen past result.
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [historicalWorkflow, setHistoricalWorkflow] = useState<WorkflowExecution | null>(null);
  const [historicalAgentLogs, setHistoricalAgentLogs] = useState<AgentLogs | null>(null);
  const [historicalIncidentNumber, setHistoricalIncidentNumber] = useState<string | null>(null);

  // Sync current workflow into history whenever it changes
  useEffect(() => {
    if (!workflow || !workflow.incident_number) return;

    const isTerminal =
      workflow.overall_status === "COMPLETED" || workflow.overall_status === "FAILED";

    upsertEntry({
      id: sessionIdRef.current,
      incident_number: workflow.incident_number,
      searched_at: workflow.created_at || new Date().toISOString(),
      overall_status: workflow.overall_status ?? null,
      // Only persist full snapshot once done so we don't store partial state
      workflowSnapshot: isTerminal ? workflow : null,
      agentLogsSnapshot: isTerminal ? agentLogs : null,
    });
  }, [workflow, agentLogs, upsertEntry]);

  // Handle clicking a history entry — restore snapshot if available, else re-run
  const handleHistorySelect = useCallback(
    (entry: HistoryEntry) => {
      // If the entry has a completed snapshot, show it without re-running
      if (
        entry.workflowSnapshot &&
        (entry.overall_status === "COMPLETED" || entry.overall_status === "FAILED")
      ) {
        setIsViewingHistory(true);
        setHistoricalWorkflow(entry.workflowSnapshot);
        setHistoricalAgentLogs(entry.agentLogsSnapshot ?? null);
        setHistoricalIncidentNumber(entry.incident_number);
        return;
      }

      // No snapshot (e.g. old entries before this feature, or incomplete runs) — re-run
      setIsViewingHistory(false);
      setHistoricalWorkflow(null);
      setHistoricalAgentLogs(null);
      setHistoricalIncidentNumber(null);

      if (workflow?.incident_number === entry.incident_number && !error) return;
      sessionIdRef.current = newSessionId();
      run({ incident_number: entry.incident_number });
    },
    [run, workflow, error]
  );

  // "Search New Workflow" — exit history view and show fresh search form
  const handleNewSearch = useCallback(() => {
    setIsViewingHistory(false);
    setHistoricalWorkflow(null);
    setHistoricalAgentLogs(null);
    setHistoricalIncidentNumber(null);
    sessionIdRef.current = newSessionId();
    reset();
  }, [reset]);

  // When user resets, prepare a new session ID for the next search
  const handleReset = useCallback(() => {
    setIsViewingHistory(false);
    setHistoricalWorkflow(null);
    setHistoricalAgentLogs(null);
    setHistoricalIncidentNumber(null);
    sessionIdRef.current = newSessionId();
    reset();
  }, [reset]);

  // When user submits a new search, assign a fresh session ID
  const handleRun = useCallback(
    (payload: StartWorkflowRequest) => {
      // Exit history view when starting a new live run
      setIsViewingHistory(false);
      setHistoricalWorkflow(null);
      setHistoricalAgentLogs(null);
      setHistoricalIncidentNumber(null);
      sessionIdRef.current = newSessionId();
      run(payload);
    },
    [run]
  );

  // ── Decide what to display ────────────────────────────────────────────────
  const displayWorkflow = isViewingHistory ? historicalWorkflow : workflow;
  const displayAgentLogs = isViewingHistory ? (historicalAgentLogs ?? {}) : agentLogs;
  const displayIncidentNumber = isViewingHistory
    ? historicalIncidentNumber
    : workflow?.incident_number ?? null;

  const diagramStatuses = displayWorkflow?.agent_statuses ?? EMPTY_AGENT_STATUSES;
  const isBusy = isLoading || isStreaming || isCaptureLoading;

  // needsResolutionCapture only applies to a live (non-historical) workflow
  const displayNeedsCapture = !isViewingHistory && needsResolutionCapture;

  const workflowDone =
    displayWorkflow?.overall_status === "COMPLETED" ||
    displayWorkflow?.overall_status === "FAILED";

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

        {/* Hide search form when viewing a historical snapshot */}
        {!isViewingHistory && (
          <>
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
            {displayNeedsCapture && displayWorkflow && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/80 mb-1">
                  Action Required
                </p>
                <p className="text-xs leading-relaxed text-amber-300/70">
                  No similar incidents found for{" "}
                  <span className="font-mono font-bold text-amber-300">
                    {displayWorkflow.incident_number}
                  </span>
                  . Please provide a resolution in the{" "}
                  <strong className="text-amber-300">Agent 4</strong> tab.
                </p>
              </div>
            )}
          </>
        )}

        {/* History panel */}
        <HistoryPanel
          entries={entries}
          onSelect={handleHistorySelect}
          onRemove={removeEntry}
          onClear={clearHistory}
          currentIncidentNumber={displayIncidentNumber}
          isViewingHistory={isViewingHistory}
          onNewSearch={handleNewSearch}
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
          {isViewingHistory && displayWorkflow && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Viewing past result
            </span>
          )}
          {!isViewingHistory && isStreaming && workflow && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-rl-gold" role="status" aria-live="polite">
              <span className="size-1.5 animate-pulse rounded-full bg-rl-gold" aria-hidden />
              Live
            </span>
          )}
          {!isViewingHistory && isCaptureLoading && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400" role="status" aria-live="polite">
              <span className="size-1.5 animate-pulse rounded-full bg-amber-400" aria-hidden />
              Saving Resolution…
            </span>
          )}
        </div>

        {/* Workflow Diagram — always shown */}
        <WorkflowDiagram agentStatuses={diagramStatuses} />

        {/* Loading skeleton */}
        {!isViewingHistory && isLoading && !workflow && (
          <div className="space-y-3" aria-busy>
            <div className="h-10 w-full animate-pulse rounded-xl bg-white/5" />
            <div className="h-40 w-full animate-pulse rounded-xl bg-white/5" />
          </div>
        )}

        {/* Empty state — before any workflow runs */}
        {!displayWorkflow && !error && !isLoading && (
          <EmptyState
            title="No workflow running"
            description="Enter a 9-character incident identifier in the panel on the left and press Start workflow."
          />
        )}

        {displayWorkflow && (workflowDone || displayNeedsCapture) && (
          <div className="space-y-4">
            <WorkflowSummaryCard workflow={displayWorkflow} />
            <div className="flex items-center gap-2 px-1 pt-1">
              <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rl-gold/70">
                Agent Results
              </span>
              {displayNeedsCapture && (
                <span className="ml-2 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden />
                  Agent 4 awaiting input
                </span>
              )}
            </div>
            <AgentTabs
              workflow={displayWorkflow}
              agentLogs={displayAgentLogs}
              needsResolutionCapture={displayNeedsCapture}
              isCaptureLoading={isCaptureLoading}
              onCaptureSubmit={isViewingHistory ? undefined : submitResolutionCapture}
            />
          </div>
        )}
      </div>
    </div>
  );
}