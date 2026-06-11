import { useEffect } from "react";
import { IncidentSearchForm } from "@/components/forms/IncidentSearchForm";
import { WorkflowDiagram } from "@/components/workflow/WorkflowDiagram";
import { WorkflowSummaryCard } from "@/components/workflow/WorkflowSummaryCard";
import { AgentTabs } from "@/components/workflow/AgentTabs";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useWorkflowRunner } from "@/hooks/useWorkflowRunner";

const EMPTY_AGENT_STATUSES = ["Agent 1","Agent 2","Agent 3","Agent 4","Agent 5"].map((name) => ({
  agent_name: name,
  status: "PENDING" as const,
  current_task: "",
  started_at: null,
  completed_at: null,
  message: "Waiting to start.",
}));

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

  const diagramStatuses = workflow?.agent_statuses ?? EMPTY_AGENT_STATUSES;
  const isBusy = isLoading || isStreaming || isCaptureLoading;
  const workflowDone =
    workflow?.overall_status === "COMPLETED" ||
    workflow?.overall_status === "FAILED";

  // When resolution capture is needed, the AgentTabs auto-switches to Agent 4.
  // We don't need to do anything extra here — AgentTabs handles the tab switch.

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

        <IncidentSearchForm onSubmit={run} onReset={reset} isLoading={isBusy} hasResult={!!workflow} />

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

        {/* Pipeline Overview info panel */}
        <div className="rounded-xl border border-rl-gold/12 bg-[#0E1E3A]/60 px-4 py-4 space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rl-gold/60">
            Pipeline Overview
          </p>
          {[
            { num: "01", label: "Data Integrity",     desc: "Validates incident fields" },
            { num: "02", label: "Similarity Search",  desc: "Semantic vector search" },
            { num: "03", label: "Incident Analysis",  desc: "Pattern recognition" },
            { num: "04", label: "Resolution Capture", desc: "Saves to knowledge base" },
            { num: "05", label: "Recommendation",     desc: "AI resolution output" },
          ].map((item) => (
            <div key={item.num} className="flex items-start gap-3">
              <span className="mt-0.5 font-mono text-[9px] font-bold text-rl-gold/35 tracking-wider">{item.num}</span>
              <div>
                <div className="text-[10px] font-semibold text-white/55 leading-none">{item.label}</div>
                <div className="text-[9px] text-white/28 leading-tight mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
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

        {/*
          Show summary + agent tabs when:
          1. Workflow is fully done (COMPLETED / FAILED), OR
          2. needsResolutionCapture is true (Agent 4 awaiting input — workflow is technically
             done from backend's perspective but needs user action)
        */}
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