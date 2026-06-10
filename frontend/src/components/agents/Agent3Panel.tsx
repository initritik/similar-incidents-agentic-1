import { CheckCircle2, XCircle } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/States";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { cn } from "@/utils/cn";
import type { Agent3Response, WorkflowAgentStatus } from "@/types/workflow";

interface Agent3PanelProps {
  agentStatus: WorkflowAgentStatus;
  result: Agent3Response | undefined;
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 75
      ? "text-emerald-600"
      : pct >= 50
        ? "text-blue-600"
        : pct >= 30
          ? "text-amber-600"
          : "text-muted-foreground";
  return (
    <div className={cn("text-center tabular-nums", color)}>
      <p className="text-lg font-bold leading-none">{pct}%</p>
      <p className="text-[9px] uppercase tracking-wide opacity-70">match</p>
    </div>
  );
}

export function Agent3Panel({ agentStatus, result }: Agent3PanelProps) {
  if (agentStatus.status === "PENDING" || agentStatus.status === "SKIPPED") {
    return (
      <EmptyState
        title={agentStatus.status === "SKIPPED" ? "Agent 3 skipped" : "Agent 3 pending"}
        description={agentStatus.message}
      />
    );
  }

  if (!result) {
    return <EmptyState title="No result available" description="Agent 3 has not produced output yet." />;
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center gap-3">
        {result.success ? (
          <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />
        ) : (
          <XCircle className="size-5 text-destructive" aria-hidden />
        )}
        <p className="text-sm font-medium">{result.message}</p>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {result.match_count} top match{result.match_count !== 1 ? "es" : ""}
          </span>
          <StatusPill status={agentStatus.status} />
        </div>
      </div>

      {/* Similar incidents found flag */}
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          result.similar_incidents_found
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            result.similar_incidents_found ? "bg-emerald-500" : "bg-amber-500",
          )}
          aria-hidden
        />
        {result.similar_incidents_found
          ? "Similar incidents found — Agent 5 will generate recommendation"
          : "No similar incidents — Agent 4 will capture a new resolution"}
      </div>

      {result.top_matches.length === 0 ? (
        <EmptyState
          title="No top matches"
          description="All candidates were below the similarity threshold."
        />
      ) : (
        <div className="space-y-3">
          {result.top_matches.map((inc, i) => (
            <div
              key={`${inc.incident_number}-${i}`}
              className="rounded-lg border bg-background p-4"
            >
              <div className="flex items-start gap-4">
                <ScoreRing score={inc.similarity_score} />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{inc.incident_number}</p>
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                      {inc.state}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{inc.short_description}</p>
                  {inc.resolution_notes && (
                    <p className="mt-2 text-xs text-foreground">
                      <span className="font-medium">Resolution: </span>
                      {inc.resolution_notes}
                    </p>
                  )}
                </div>
              </div>
              {inc.datafix_id && (
                <div className="mt-3 rounded-md bg-muted/40 px-3 py-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Datafix {inc.datafix_id}
                  </p>
                  {inc.datafix_description && (
                    <p className="mb-1.5 text-xs text-foreground">{inc.datafix_description}</p>
                  )}
                  {inc.datafix_code && <CodeBlock code={inc.datafix_code} />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}