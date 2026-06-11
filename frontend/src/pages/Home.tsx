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
  const { workflow, isLoading, isStreaming, error, agentLogs, run, reset } = useWorkflowRunner();
  const diagramStatuses = workflow?.agent_statuses ?? EMPTY_AGENT_STATUSES;
  const isBusy = isLoading || isStreaming;
  const workflowDone = workflow?.overall_status === "COMPLETED" || workflow?.overall_status === "FAILED";

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
        </div>

        {/* Workflow Diagram — always shown */}
        <WorkflowDiagram agentStatuses={diagramStatuses} />

        {/*
          The block below is reserved and stable in height until workflow completes.
          Empty/loading states sit here. Agent results only appear after all agents finish.
        */}

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

        {/* Summary strip + Agent Tabs — only after workflow is fully complete */}
        {workflow && workflowDone && (
          <div className="space-y-4">
            <WorkflowSummaryCard workflow={workflow} />
            <div className="flex items-center gap-2 px-1 pt-1">
              <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rl-gold/70">
                Agent Results
              </span>
            </div>
            <AgentTabs workflow={workflow} agentLogs={agentLogs} />
          </div>
        )}
      </div>
    </div>
  );
}