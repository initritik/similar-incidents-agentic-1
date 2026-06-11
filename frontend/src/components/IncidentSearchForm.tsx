import { useState } from "react";
import { PlayCircle, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StartWorkflowRequest } from "@/types/workflow";

interface IncidentSearchFormProps {
  onSubmit: (payload: StartWorkflowRequest) => void;
  onReset?: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const INCIDENT_ID_LENGTH = 9;

export function IncidentSearchForm({ onSubmit, onReset, isLoading, hasResult }: IncidentSearchFormProps) {
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
    <aside className="rounded-xl border border-rl-gold/15 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-rl-gold/10 bg-[#070F1E]/40 px-5 py-3.5">
        <Search className="size-3.5 text-rl-gold" aria-hidden />
        <h2 className="text-sm font-semibold text-white/80">Run Workflow</h2>
      </div>

      <div className="px-5 py-5">
        <p className="text-xs leading-relaxed text-white/40">
          Enter a ServiceNow incident identifier to start the five-agent AI resolution pipeline.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="incident-id" className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
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
                "h-11 w-full rounded-lg border bg-[#070F1E]/80 px-3.5",
                "font-mono text-sm font-medium uppercase tracking-widest text-white/90",
                "placeholder:normal-case placeholder:tracking-normal placeholder:text-white/20 placeholder:font-normal",
                "transition-colors focus:outline-none",
                "focus-visible:border-rl-gold focus-visible:ring-2 focus-visible:ring-rl-gold/25",
                "disabled:opacity-50",
                validationError ? "border-red-500/50" : "border-white/10 hover:border-rl-gold/30",
              ].join(" ")}
            />
            {validationError && (
              <p id="incident-id-error" role="alert" className="text-[11px] text-red-400">
                {validationError}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/30">
                {value.length} / {INCIDENT_ID_LENGTH} characters
              </p>
              <div className="h-0.5 w-20 overflow-hidden rounded-full bg-white/8">
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
                "flex-1 h-10 font-bold text-sm tracking-wide",
                "bg-rl-gold text-[#070F1E]",
                "hover:bg-rl-gold-light",
                "shadow-[0_0_16px_rgba(201,168,76,0.4)]",
                "border border-rl-gold",
                "focus-visible:ring-rl-gold/40",
                "transition-all duration-200",
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
                className="h-10 w-10 border-white/15 text-white/40 hover:border-rl-gold/50 hover:text-white/80 bg-transparent"
              >
                <RotateCcw className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        </form>
      </div>
    </aside>
  );
}