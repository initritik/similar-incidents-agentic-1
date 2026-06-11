import { IncidentSearchForm } from "@/components/forms/IncidentSearchForm";
import { WorkflowDiagram } from "@/components/workflow/WorkflowDiagram";
import { WorkflowSummaryCard } from "@/components/workflow/WorkflowSummaryCard";
import { AgentTabs } from "@/components/workflow/AgentTabs";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useWorkflowRunner } from "@/hooks/useWorkflowRunner";
import { Cpu } from "lucide-react";

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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 lg:flex-row lg:items-start">

      {/* ── LEFT SIDEBAR — Incident Search ──────────────────────────── */}
      <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[320px]">
        {/* Sidebar header */}
        <div className="mb-4 flex items-center gap-2.5 px-1">
          <div className="h-4 w-0.5 rounded-full bg-rl-gold" aria-hidden />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rl-gold/70"
          >
            Incident Search
          </span>
        </div>

        <IncidentSearchForm
          onSubmit={run}
          onReset={reset}
          isLoading={isBusy}
          hasResult={!!workflow}
        />

        {/* Error state */}
        {error && (
          <div className="mt-4">
            <ErrorState
              title="Workflow Error"
              message={error || "An unexpected error occurred"}
            />
          </div>
        )}

        {/* Info panel */}
        <div className="mt-5 rounded-xl border border-rl-gold/10 bg-rl-navy/30 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="size-3.5 text-rl-gold/60" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-rl-gold/60">
              Pipeline Overview
            </span>
          </div>
          {[
            { num: "01", label: "Data Integrity", desc: "Validates incident fields" },
            { num: "02", label: "Similarity Search", desc: "Semantic vector search" },
            { num: "03", label: "Incident Analysis", desc: "Pattern recognition" },
            { num: "04", label: "Resolution Capture", desc: "Saves to knowledge base" },
            { num: "05", label: "Recommendation", desc: "AI resolution output" },
          ].map((item) => (
            <div key={item.num} className="flex items-start gap-3">
              <span className="mt-0.5 font-mono text-[9px] font-bold text-rl-gold/40 tracking-wider">
                {item.num}
              </span>
              <div>
                <div className="text-[10px] font-semibold text-white/60 leading-none">
                  {item.label}
                </div>
                <div className="text-[9px] text-white/30 leading-tight mt-0.5">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── VERTICAL DIVIDER (desktop only) ─────────────────────────── */}
      <div
        className="hidden w-px self-stretch bg-rl-gold/8 lg:block"
        aria-hidden
      />

      {/* ── RIGHT PANEL — Diagram + Results ─────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">

        {/* Section label */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="h-4 w-0.5 rounded-full bg-rl-gold" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rl-gold/70">
            Pipeline Status
          </span>
          {/* Live streaming indicator */}
          {isStreaming && workflow && (
            <span
              className="ml-auto flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rl-gold"
              role="status"
              aria-live="polite"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-rl-gold shadow-[0_0_8px_rgba(201,168,76,0.9)]" aria-hidden />
              Live
            </span>
          )}
        </div>

        {/* ── Workflow Diagram ────────────────────────────────── */}
        <WorkflowDiagram agentStatuses={diagramStatuses} />

        {/* ── LOADING skeleton ──────────────────────────────────────── */}
        {isLoading && !workflow && (
          <div className="space-y-3" aria-busy aria-label="Starting workflow">
            <div className="h-10 w-full animate-pulse rounded-xl bg-rl-navy/60" />
            <div className="h-48 w-full animate-pulse rounded-2xl bg-rl-navy/60" />
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
          <div className="space-y-5">
            {/* Compact summary strip */}
            <WorkflowSummaryCard workflow={workflow} />

            {/* Section label for individual agent results */}
            <div className="flex items-center gap-2.5 px-1 pt-1">
              <div className="h-4 w-0.5 rounded-full bg-rl-gold" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rl-gold/70">
                Agent Results
              </span>
            </div>

            {/* ── Agent Tabs ─────────────────────────── */}
            <AgentTabs workflow={workflow} agentLogs={agentLogs} />
          </div>
        )}
      </div>
    </div>
  );
}