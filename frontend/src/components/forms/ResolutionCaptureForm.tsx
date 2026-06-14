import { useState } from "react";
import { Save, Code2, FileText, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StartWorkflowRequest, Agent4Response } from "@/types/workflow";

interface ResolutionCaptureFormProps {
  incidentNumber: string;
  onSubmit: (payload: StartWorkflowRequest) => void;
  isLoading: boolean;
  /** Pass the Agent 4 result once the workflow completes to show a success state */
  agent4Result?: Agent4Response;
}

export function ResolutionCaptureForm({
  incidentNumber,
  onSubmit,
  isLoading,
  agent4Result,
}: ResolutionCaptureFormProps) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [datafixDescription, setDatafixDescription] = useState("");
  const [datafixCode, setDatafixCode] = useState("");
  const [showDatafix, setShowDatafix] = useState(false);
  const [touched, setTouched] = useState(false);

  const resolutionError =
    touched && !resolutionNotes.trim()
      ? "Resolution notes are required."
      : null;

  // If Agent 4 completed successfully and saved, show the resolved confirmation instead of the form.
  const isResolved = agent4Result?.saved === true && agent4Result?.success === true;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!resolutionNotes.trim()) return;

    onSubmit({
      incident_number: incidentNumber,
      provide_resolution: true,
      resolution_notes: resolutionNotes.trim(),
      datafix_description: datafixDescription.trim() || null,
      datafix_code: datafixCode.trim() || null,
    });
  }

  // ── Resolved confirmation view ────────────────────────────────────────────
  if (isResolved) {
    return (
      <div className="space-y-3">
        {/* Main success card */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/8 px-5 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="size-5 mt-0.5 shrink-0 text-emerald-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-300">
                Incident Resolved &amp; Knowledge Base Updated
              </p>
              <p className="mt-1 text-xs text-emerald-300/70 leading-relaxed">
                <span className="font-mono font-bold">{incidentNumber}</span> has
                been marked as{" "}
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  RESOLVED
                </span>{" "}
                and the resolution has been ingested into the Qdrant knowledge base
                for future incident matching.
              </p>
            </div>
          </div>
        </div>

        {/* Datafix confirmation */}
        {agent4Result?.datafix_saved && (
          <div className="rounded-lg border border-rl-gold/20 bg-rl-gold/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Code2 className="size-3.5 shrink-0 text-rl-gold/70" />
              <p className="text-xs text-rl-gold/80">
                Datafix recorded and appended to the mock data store.
              </p>
            </div>
          </div>
        )}

        {/* State update confirmation */}
        {agent4Result?.incident_state_updated && (
          <div className="rounded-lg border border-muted/20 bg-muted/5 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Incident state updated from{" "}
                <span className="font-semibold text-foreground/60">OPEN / WORK_IN_PROGRESS</span>{" "}
                →{" "}
                <span className="font-semibold text-emerald-400">RESOLVED</span>{" "}
                in the mock incidents data store.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Capture form ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 size-2 shrink-0 rounded-full bg-amber-400 animate-pulse" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              New Incident — Resolution Required
            </p>
            <p className="mt-1 text-xs text-amber-300/70 leading-relaxed">
              No similar incidents were found with a match score ≥ 50%. Provide a
              resolution for{" "}
              <span className="font-mono font-bold">{incidentNumber}</span> so it
              can be ingested into the knowledge base and the incident can be
              marked as{" "}
              <span className="font-semibold text-emerald-400/80">RESOLVED</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Resolution Notes */}
        <div className="space-y-1.5">
          <label
            htmlFor="resolution-notes"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/70"
          >
            <FileText className="size-3 text-rl-gold/70" aria-hidden />
            Resolution Notes
            <span className="text-destructive">*</span>
          </label>
          <textarea
            id="resolution-notes"
            rows={5}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={isLoading}
            placeholder="Describe the steps taken to resolve this incident…"
            aria-invalid={!!resolutionError}
            aria-describedby={resolutionError ? "resolution-notes-error" : undefined}
            className={[
              "w-full rounded-lg border bg-background px-3.5 py-2.5",
              "text-sm text-foreground resize-none",
              "placeholder:text-muted-foreground/50",
              "transition-colors focus:outline-none",
              "focus-visible:border-rl-gold focus-visible:ring-[3px] focus-visible:ring-rl-gold/20",
              "disabled:opacity-50",
              resolutionError ? "border-destructive" : "border-input hover:border-rl-navy/40",
            ].join(" ")}
          />
          {resolutionError && (
            <p id="resolution-notes-error" role="alert" className="text-[11px] text-destructive">
              {resolutionError}
            </p>
          )}
        </div>

        {/* Datafix toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowDatafix((v) => !v)}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs font-semibold text-rl-gold/80 hover:text-rl-gold transition-colors disabled:opacity-50"
          >
            <Code2 className="size-3.5" aria-hidden />
            {showDatafix ? "Hide Datafix (Optional)" : "Add Datafix (Optional)"}
            <span className="rounded border border-rl-gold/30 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-rl-gold/50">
              optional
            </span>
          </button>

          {showDatafix && (
            <div className="mt-3 space-y-3 rounded-lg border border-rl-gold/15 bg-rl-navy/30 p-4">
              {/* Datafix Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="datafix-description"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground/60"
                >
                  Datafix Description
                </label>
                <input
                  id="datafix-description"
                  type="text"
                  value={datafixDescription}
                  onChange={(e) => setDatafixDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Brief description of the datafix applied…"
                  className={[
                    "h-9 w-full rounded-lg border bg-background px-3 text-sm",
                    "placeholder:text-muted-foreground/50",
                    "transition-colors focus:outline-none",
                    "focus-visible:border-rl-gold focus-visible:ring-[3px] focus-visible:ring-rl-gold/20",
                    "border-input hover:border-rl-navy/40 disabled:opacity-50",
                  ].join(" ")}
                />
              </div>

              {/* Datafix Code */}
              <div className="space-y-1.5">
                <label
                  htmlFor="datafix-code"
                  className="text-xs font-semibold uppercase tracking-wider text-foreground/60"
                >
                  Datafix Code / Script
                </label>
                <textarea
                  id="datafix-code"
                  rows={4}
                  value={datafixCode}
                  onChange={(e) => setDatafixCode(e.target.value)}
                  disabled={isLoading}
                  placeholder={"-- SQL / script used to fix the data\nUPDATE table SET col = val WHERE id = ?;"}
                  className={[
                    "w-full rounded-lg border bg-background px-3 py-2",
                    "font-mono text-xs text-foreground resize-none",
                    "placeholder:font-sans placeholder:text-muted-foreground/50",
                    "transition-colors focus:outline-none",
                    "focus-visible:border-rl-gold focus-visible:ring-[3px] focus-visible:ring-rl-gold/20",
                    "border-input hover:border-rl-navy/40 disabled:opacity-50",
                  ].join(" ")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className={[
            "w-full h-10 bg-rl-navy text-white font-semibold text-sm",
            "hover:bg-rl-navy-mid transition-colors",
            "border border-rl-navy",
            "focus-visible:ring-rl-gold/40",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving &amp; Resolving…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden />
              Save, Resolve &amp; Ingest to Knowledge Base
            </>
          )}
        </Button>
      </form>
    </div>
  );
}