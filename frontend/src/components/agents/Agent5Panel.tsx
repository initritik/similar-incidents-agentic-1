import { CheckCircle2, XCircle, SkipForward, Lightbulb, FileText, Hash } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/States";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { cn } from "@/utils/cn";
import type { Agent5Response, WorkflowAgentStatus } from "@/types/workflow";

interface Agent5PanelProps {
  agentStatus: WorkflowAgentStatus;
  result: Agent5Response | undefined;
}

function ConfidenceBadge({ summary }: { summary: string }) {
  const level = summary.split(" ")[0].toLowerCase(); // "high", "medium-high", etc.
  const color =
    level.startsWith("high")
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : level.startsWith("medium-high")
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        : level.startsWith("medium")
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        color,
      )}
    >
      <Lightbulb className="size-3" aria-hidden />
      {summary}
    </span>
  );
}

export function Agent5Panel({ agentStatus, result }: Agent5PanelProps) {
  if (agentStatus.status === "SKIPPED") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
        <SkipForward className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">Agent 5 skipped</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          No similar incidents were found — Agent 4 captured a new resolution
          instead.
        </p>
      </div>
    );
  }

  if (agentStatus.status === "PENDING") {
    return (
      <EmptyState title="Agent 5 pending" description={agentStatus.message} />
    );
  }

  if (!result) {
    return (
      <EmptyState
        title="No result available"
        description="Agent 5 has not produced output yet."
      />
    );
  }

  if (!result.success) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <XCircle className="size-5 text-destructive" aria-hidden />
          <p className="text-sm font-medium text-foreground">{result.message}</p>
          <StatusPill status={agentStatus.status} className="ml-auto" />
        </div>
        <EmptyState
          title="No recommendation generated"
          description="No resolved similar incidents were available to base a recommendation on."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status row */}
      <div className="flex flex-wrap items-center gap-3">
        <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />
        <p className="text-sm font-medium text-foreground">{result.message}</p>
        <StatusPill status={agentStatus.status} className="ml-auto" />
      </div>

      {/* Confidence summary */}
      {result.confidence_summary && (
        <ConfidenceBadge summary={result.confidence_summary} />
      )}

      {/* Source incidents */}
      {result.source_incident_numbers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Based on incidents
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.source_incident_numbers.map((num) => (
              <span
                key={num}
                className="flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs"
              >
                <Hash className="size-3" aria-hidden />
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended resolution */}
      {result.recommended_resolution && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended resolution
            </p>
          </div>
          <div className="rounded-lg border bg-background px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {result.recommended_resolution}
            </p>
          </div>
        </div>
      )}

      {/* Recommended datafix */}
      {result.recommended_datafix && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended datafix
            </p>
          </div>
          <CodeBlock code={result.recommended_datafix} />
        </div>
      )}

      {/* Source datafix IDs */}
      {result.source_datafix_ids.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Source datafixes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.source_datafix_ids.map((id) => (
              <span
                key={id}
                className="rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs"
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source resolution notes */}
      {result.source_resolution_notes.filter(Boolean).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Source resolution notes
          </p>
          <div className="space-y-2">
            {result.source_resolution_notes.filter(Boolean).map((note, i) => (
              <div
                key={i}
                className="rounded-md border-l-2 border-blue-300 bg-muted/30 px-3 py-2 text-xs text-foreground"
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}