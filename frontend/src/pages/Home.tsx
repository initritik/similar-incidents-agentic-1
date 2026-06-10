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
  const { workflow, isLoading, isPolling, error, run, reset } =
    useWorkflowRunner();

  const diagramStatuses =
    workflow?.agent_statuses ?? EMPTY_AGENT_STATUSES;

  return (
    <div className="flex flex-1 flex-col gap-8">
      {/* ── Page header ────────────────────────────────────────────────── */}
      <header className="border-b pb-6">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-muted-foreground">
            Incident Resolution Assistant
          </p>
        </div>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground">
          AI-powered incident triage
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Enter a ServiceNow incident identifier to run the five-agent resolution
          pipeline. The system finds similar resolved incidents or captures a new
          resolution for future use.
        </p>
      </header>

      {/* ── Top section: diagram + form ────────────────────────────────── */}
      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <WorkflowDiagram agentStatuses={diagramStatuses} />
        <IncidentSearchForm
          onSubmit={run}
          onReset={reset}
          isLoading={isLoading || isPolling}
          hasResult={!!workflow}
        />
      </section>

      {/* ── Error state ────────────────────────────────────────────────── */}
      {error && (
        <ErrorState
          title="Workflow Error"
          message={error || "An unexpected error occurred"}
        />
      )}

      {/* ── No workflow yet ────────────────────────────────────────────── */}
      {!workflow && !error && !isLoading && (
        <EmptyState
          title="No workflow running"
          description="Enter a 9-character incident identifier above and press Start workflow."
        />
      )}

      {/* ── Loading skeleton while waiting for first response ─────────── */}
      {isLoading && !workflow && (
        <div className="space-y-3" aria-busy aria-label="Starting workflow">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      )}

      {/* ── Workflow results ───────────────────────────────────────────── */}
      {workflow && (
        <div className="space-y-5">
          <WorkflowSummaryCard workflow={workflow} />
          <AgentTabs workflow={workflow} />
        </div>
      )}
    </div>
  );
}