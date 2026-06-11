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
    <aside className="gold-border-card rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
      {/* Card header strip */}
      <div className="flex items-center gap-3 border-b border-rl-gold/10 bg-rl-deep/60 px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rl-gold/10 ring-1 ring-rl-gold/25">
          <Search className="size-3.5 text-rl-gold" aria-hidden />
        </div>
        <h2
          className="text-sm font-semibold text-rl-gold-light"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Run Workflow
        </h2>
      </div>

      <div className="px-5 py-5">
        <p className="text-xs leading-relaxed text-white/40">
          Enter a ServiceNow incident identifier to start the five-agent AI
          resolution pipeline.
        </p>

        <div className="mt-5 space-y-4">
          {/* Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="incident-id"
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-rl-gold/60"
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
                "h-12 w-full rounded-xl border bg-rl-deep/80 px-4",
                "font-mono text-sm font-semibold uppercase tracking-[0.2em] text-white/90",
                "placeholder:normal-case placeholder:tracking-normal placeholder:text-white/20 placeholder:font-normal",
                "transition-all duration-200 focus:outline-none",
                "focus-visible:border-rl-gold focus-visible:ring-2 focus-visible:ring-rl-gold/25 focus-visible:shadow-[0_0_16px_rgba(201,168,76,0.15)]",
                "disabled:opacity-50",
                validationError
                  ? "border-red-500/50"
                  : "border-rl-gold/15 hover:border-rl-gold/30",
              ].join(" ")}
            />
            {validationError && (
              <p
                id="incident-id-error"
                role="alert"
                className="text-[11px] text-red-400"
              >
                {validationError}
              </p>
            )}

            {/* Character count progress */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/25">
                {value.length} / {INCIDENT_ID_LENGTH} chars
              </p>
              <div className="h-0.5 w-20 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-rl-gold transition-all duration-200"
                  style={{
                    width: `${(value.length / INCIDENT_ID_LENGTH) * 100}%`,
                    boxShadow: value.length === INCIDENT_ID_LENGTH
                      ? "0 0 8px rgba(201,168,76,0.6)"
                      : undefined,
                  }}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isLoading}
              aria-busy={isLoading}
              onClick={handleSubmit}
              className={[
                "flex flex-1 items-center justify-center gap-2 h-11 rounded-xl",
                "bg-rl-gold text-rl-deep font-bold text-sm tracking-wide uppercase",
                "hover:bg-rl-gold-light transition-all duration-200",
                "shadow-lg shadow-rl-gold/20 hover:shadow-rl-gold/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rl-gold",
              ].join(" ")}
            >
              <PlayCircle className="size-4" aria-hidden />
              {isLoading ? "Starting…" : "Start Workflow"}
            </button>

            {hasResult && (
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset workflow"
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-xl shrink-0",
                  "border border-rl-gold/20 bg-transparent text-white/40",
                  "hover:border-rl-gold/50 hover:text-rl-gold/80 transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rl-gold",
                ].join(" ")}
              >
                <RotateCcw className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}