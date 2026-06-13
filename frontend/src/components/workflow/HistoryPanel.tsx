import { Clock, Trash2, X, CheckCircle2, XCircle, Loader2, SkipForward, Plus } from "lucide-react";
import type { HistoryEntry } from "@/hooks/useHistory";
import { cn } from "@/utils/cn";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  /** Called when user clicks a history entry — passes the full entry (with snapshot) */
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  currentIncidentNumber?: string | null;
  /** Whether we're currently viewing a historical snapshot (not a live workflow) */
  isViewingHistory?: boolean;
  /** Called when user clicks "Search New Workflow" */
  onNewSearch?: () => void;
}

function StatusIcon({ status }: { status: HistoryEntry["overall_status"] }) {
  if (status === "COMPLETED")
    return <CheckCircle2 className="size-3 shrink-0 text-emerald-500" aria-hidden />;
  if (status === "FAILED")
    return <XCircle className="size-3 shrink-0 text-destructive" aria-hidden />;
  if (status === "SKIPPED")
    return <SkipForward className="size-3 shrink-0 text-muted-foreground" aria-hidden />;
  if (status === "RUNNING" || status === "PENDING")
    return <Loader2 className="size-3 shrink-0 animate-spin text-rl-gold" aria-hidden />;
  return <div className="size-3 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HistoryPanel({
  entries,
  onSelect,
  onRemove,
  onClear,
  currentIncidentNumber,
  isViewingHistory = false,
  onNewSearch,
}: HistoryPanelProps) {
  return (
    <div className="rounded-xl border border-rl-gold/12 bg-[#0E1E3A]/60 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-rl-gold/10">
        <div className="flex items-center gap-2">
          <Clock className="size-3 text-rl-gold/60" aria-hidden />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rl-gold/60">
            Search History
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] text-white/25 hover:text-destructive transition-colors"
            aria-label="Clear all history"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search New Workflow button — shown when viewing a historical snapshot */}
      {isViewingHistory && (
        <div className="px-3 py-2.5 border-b border-rl-gold/10">
          <button
            onClick={onNewSearch}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg",
              "text-[11px] font-semibold text-rl-gold border border-rl-gold/40",
              "bg-rl-gold/8 hover:bg-rl-gold/15 transition-colors"
            )}
          >
            <Plus className="size-3" aria-hidden />
            Search New Workflow
          </button>
        </div>
      )}

      {/* Entries */}
      <div className="max-h-[280px] overflow-y-auto">
        {entries.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <p className="text-[11px] text-white/25">No searches yet.</p>
            <p className="text-[10px] text-white/15 mt-0.5">
              Past incidents will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-rl-gold/8">
            {entries.map((entry) => {
              const isActive = entry.incident_number === currentIncidentNumber;
              return (
                <li key={entry.id} className="group relative">
                  <button
                    onClick={() => onSelect(entry)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      "hover:bg-rl-gold/8",
                      isActive && "bg-rl-gold/10"
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <StatusIcon status={entry.overall_status} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "font-mono text-[11px] font-semibold leading-none truncate",
                          isActive ? "text-rl-gold" : "text-white/70"
                        )}
                      >
                        {entry.incident_number}
                      </p>
                      <p className="text-[9px] text-white/25 mt-0.5">
                        {formatTime(entry.searched_at)}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rl-gold/50">
                        {isViewingHistory ? "viewing" : "current"}
                      </span>
                    )}
                  </button>

                  {/* Remove button — only on hover, not for active */}
                  {!isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(entry.id);
                      }}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "text-white/25 hover:text-destructive"
                      )}
                      aria-label={`Remove ${entry.incident_number} from history`}
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}