import { useState } from "react";
import { PlayCircle, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/States";
import type { StartWorkflowRequest } from "@/types/workflow";

interface IncidentSearchFormProps {
  onSubmit: (payload: StartWorkflowRequest) => void;
  onReset?: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const INCIDENT_ID_LENGTH = 9;

export function IncidentSearchForm({
  onSubmit,
  onReset,
  isLoading,
  hasResult,
}: IncidentSearchFormProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const validationError =
    touched && value.length !== INCIDENT_ID_LENGTH
      ? "Please enter a 9-character identifier (e.g. INC000005)."
      : null;

  const isValid = value.length === INCIDENT_ID_LENGTH;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit({ incident_number: value.trim().toUpperCase() });
  }

  function handleReset() {
    setValue("");
    setTouched(false);
    onReset?.();
  }

  return (
    <aside className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Card header strip */}
      <div className="flex items-center gap-2.5 border-b border-border bg-rl-navy/[0.03] px-5 py-3.5">
        <Search className="size-3.5 text-rl-gold" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">Run Workflow</h2>
      </div>

      <div className="px-5 py-5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Enter a ServiceNow incident identifier to start the five-agent AI
          resolution pipeline.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="incident-id"
              className="text-xs font-semibold uppercase tracking-wider text-foreground/70"
            >
              Incident ID
            </label>
            <input
              id="incident-id"
              type="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={INCIDENT_ID_LENGTH}
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              onBlur={() => setTouched(true)}
              placeholder="INC000005"
              aria-describedby={validationError ? "incident-id-error" : undefined}
              aria-invalid={!!validationError}
              disabled={isLoading}
              className={[
                "h-11 w-full rounded-lg border bg-background px-3.5",
                "font-mono text-sm font-medium uppercase tracking-widest",
                "placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/60",
                "transition-colors focus:outline-none",
                "focus-visible:border-rl-gold focus-visible:ring-[3px] focus-visible:ring-rl-gold/20",
                "disabled:opacity-50",
                validationError
                  ? "border-destructive"
                  : "border-input hover:border-rl-navy/40",
              ].join(" ")}
            />
            {validationError && (
              <p
                id="incident-id-error"
                role="alert"
                className="text-[11px] text-destructive"
              >
                {validationError}
              </p>
            )}

            {/* Character count progress */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {value.length} / {INCIDENT_ID_LENGTH} characters
              </p>
              {/* Mini progress bar */}
              <div className="h-0.5 w-20 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-rl-gold transition-all duration-200"
                  style={{ width: `${(value.length / INCIDENT_ID_LENGTH) * 100}%` }}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className={[
                "flex-1 h-10 bg-rl-navy text-white font-semibold text-sm",
                "hover:bg-rl-navy-mid transition-colors",
                "border border-rl-navy",
                "focus-visible:ring-rl-gold/40",
              ].join(" ")}
            >
              <PlayCircle className="size-4" aria-hidden />
              {isLoading ? "Starting…" : "Start Workflow"}
            </Button>

            {hasResult && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleReset}
                aria-label="Reset workflow"
                className="h-10 w-10 border-border text-muted-foreground hover:border-rl-gold/50 hover:text-rl-navy"
              >
                <RotateCcw className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        </form>

        {/* Pipeline info */}
        {/* <div className="mt-5 space-y-1.5 rounded-lg bg-rl-ivory-dark/50 px-4 py-3.5 dark:bg-muted/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            5-Agent Pipeline
          </p>
          {[
            "Data Integrity",
            "Similarity Search",
            "Incident Analysis",
            "Resolution Capture",
            "Recommendation",
          ].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-4 text-[10px] font-bold text-rl-gold/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div> */}
      </div>
    </aside>
  );
}