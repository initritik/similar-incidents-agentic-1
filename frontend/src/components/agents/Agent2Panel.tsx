import { CheckCircle2, XCircle } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/States";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { cn } from "@/utils/cn";
import type { Agent2Response, WorkflowAgentStatus } from "@/types/workflow";

interface Agent2PanelProps {
  agentStatus: WorkflowAgentStatus;
  result: Agent2Response | undefined;
}

// 20 segments — each segment represents 5% similarity.
// Filled segments use a colour class based on overall score.
function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const filledSegments = Math.round(pct / 5);
  const colorClass =
    pct >= 75
      ? "bg-emerald-500"
      : pct >= 50
        ? "bg-blue-500"
        : pct >= 30
          ? "bg-amber-500"
          : "bg-red-400";

  return (
    <div className="flex items-center gap-2" aria-label={`Similarity score: ${pct}%`}>
      <div className="flex flex-1 gap-px" aria-hidden>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-sm transition-colors",
              i < filledSegments ? colorClass : "bg-border",
            )}
          />
        ))}
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
}

export function Agent2Panel({ agentStatus, result }: Agent2PanelProps) {
  if (agentStatus.status === "PENDING" || agentStatus.status === "SKIPPED") {
    return (
      <EmptyState
        title={agentStatus.status === "SKIPPED" ? "Agent 2 skipped" : "Agent 2 pending"}
        description={agentStatus.message}
      />
    );
  }

  if (!result) {
    return (
      <EmptyState
        title="No result available"
        description="Agent 2 has not produced output yet."
      />
    );
  }

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
        <span className="ml-auto text-xs text-muted-foreground">
          {result.match_count} match{result.match_count !== 1 ? "es" : ""}
        </span>
        <StatusPill status={agentStatus.status} />
      </div>

      {result.similar_incidents.length === 0 ? (
        <EmptyState
          title="No similar incidents found"
          description="The vector search returned no results above the similarity threshold."
        />
      ) : (
        <div className="space-y-3">
          {result.similar_incidents.map((inc, i) => (
            <div
              key={`${inc.incident_number}-${i}`}
              className="space-y-3 rounded-lg border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {inc.incident_number}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {inc.short_description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  {inc.state}
                </span>
              </div>

              <ScoreBar score={inc.similarity_score} />

              {inc.datafix_id && (
                <div className="rounded-md bg-muted/40 px-3 py-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Datafix {inc.datafix_id}
                  </p>
                  {inc.datafix_description && (
                    <p className="text-xs text-foreground">
                      {inc.datafix_description}
                    </p>
                  )}
                  {inc.datafix_code && (
                    <CodeBlock code={inc.datafix_code} className="mt-2" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}