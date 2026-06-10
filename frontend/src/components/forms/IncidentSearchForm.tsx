import { useState } from "react";
import { PlayCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/States";
import type { StartWorkflowRequest } from "@/types/workflow";

interface IncidentSearchFormProps {
  onSubmit: (payload: StartWorkflowRequest) => void;
  onReset?: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const INCIDENT_ID_LENGTH = 10;

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
      ? "Please enter a 10-character incident identifier."
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
    <aside className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Run Workflow</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter a ServiceNow incident identifier to start the AI resolution pipeline.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="incident-id"
            className="text-sm font-medium text-foreground"
          >
            Incident identifier
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
            placeholder="INC0000010"
            aria-describedby={validationError ? "incident-id-error" : undefined}
            aria-invalid={!!validationError}
            disabled={isLoading}
            className="h-10 w-full rounded-md border bg-background px-3 font-mono text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
          />
          {validationError && (
            <p
              id="incident-id-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {validationError}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {value.length} / {INCIDENT_ID_LENGTH} characters
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            <PlayCircle aria-hidden />
            {isLoading ? "Starting…" : "Start workflow"}
          </Button>

          {hasResult && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleReset}
              aria-label="Reset workflow"
            >
              <RotateCcw aria-hidden />
            </Button>
          )}
        </div>
      </form>
    </aside>
  );
}