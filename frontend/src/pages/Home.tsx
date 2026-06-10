import { Bot } from "lucide-react";
import { IncidentSearchForm } from "@/components/forms/IncidentSearchForm";
import { WorkflowDiagram } from "@/components/workflow/WorkflowDiagram";
import { WorkflowSummaryCard } from "@/components/workflow/WorkflowSummaryCard";
import { AgentTabs } from "@/components/workflow/AgentTabs";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useWorkflowRunner } from "@/hooks/useWorkflowRunner";

// Default 5-agent pending statuses shown before any workflow runs
const EMPTY_AGENT_STATUSES = [
  "Agent 1",
  "Agent 2",
  "Agent 3",
  "Agent 4",
  "Agent 5",
].map((name) => ({
  agent_name: name,
  status: "PENDING" as const,
  current_task: "",
  started_at: null,
  completed_at: null,
  message: "Waiting to start.",
}));

export function Home() {
  const { workflow, isLoading, isStreaming, error, agentLogs, run, reset } =
    useWorkflowRunner();

  const diagramStatuses = workflow?.agent_statuses ?? EMPTY_AGENT_STATUSES;
  const isBusy = isLoading || isStreaming;

  return (
    /*
     * Layout: 3-column on large screens
     *   [Left sidebar: search form] | [Right: diagram top, agent results below]
     *
     * lg breakpoint: sidebar (300px fixed) + main panel (flex-1)
     * Main panel: WorkflowDiagram on top, AgentTabs below
     */
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-5 lg:flex-row lg:items-start">

      {/* ── LEFT SIDEBAR — Incident Search ──────────────────────────── */}
      <aside className="w-full shrink-0 lg:sticky lg:top-[3.5rem] lg:w-[300px]">
        {/* Sidebar header */}
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Incident Search
          </span>
        </div>

        <IncidentSearchForm
          onSubmit={run}
          onReset={reset}
          isLoading={isBusy}
          hasResult={!!workflow}
        />

        {/* Error state — lives in the sidebar, below the form */}
        {error && (
          <div className="mt-4">
            <ErrorState
              title="Workflow Error"
              message={error || "An unexpected error occurred"}
            />
          </div>
        )}
      </aside>

      {/* ── VERTICAL DIVIDER (desktop only) ─────────────────────────── */}
      <div
        className="hidden w-px self-stretch bg-border/60 lg:block"
        aria-hidden
      />

      {/* ── RIGHT PANEL — Diagram + Results ─────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">

        {/* Section label */}
        <div className="flex items-center gap-2 px-1">
          <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Pipeline Status
          </span>
          {/* Live streaming indicator */}
          {isStreaming && workflow && (
            <span
              className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-rl-gold"
              role="status"
              aria-live="polite"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-rl-gold" aria-hidden />
              Live
            </span>
          )}
        </div>

        {/* ── TOP-RIGHT: Workflow Diagram ────────────────────────────── */}
        <WorkflowDiagram agentStatuses={diagramStatuses} />

        {/* ── LOADING skeleton ──────────────────────────────────────── */}
        {isLoading && !workflow && (
          <div className="space-y-3" aria-busy aria-label="Starting workflow">
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {/* ── EMPTY state ───────────────────────────────────────────── */}
        {!workflow && !error && !isLoading && (
          <EmptyState
            title="No workflow running"
            description="Enter a 9-character incident identifier in the panel on the left and press Start workflow."
          />
        )}

        {/* ── WORKFLOW results ──────────────────────────────────────── */}
        {workflow && (
          <div className="space-y-4">
            {/* Compact summary strip */}
            <WorkflowSummaryCard workflow={workflow} />

            {/* Section label for individual agent results */}
            <div className="flex items-center gap-2 px-1 pt-1">
              <div className="h-3 w-0.5 rounded-full bg-rl-gold" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Agent Results
              </span>
            </div>

            {/* ── BOTTOM-RIGHT: Agent Tabs ─────────────────────────── */}
            <AgentTabs workflow={workflow} agentLogs={agentLogs} />
          </div>
        )}
      </div>
    </div>
  );
}