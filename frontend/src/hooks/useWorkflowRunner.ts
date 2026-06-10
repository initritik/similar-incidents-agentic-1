import { useCallback, useEffect, useRef, useState } from "react";
import { workflowService } from "@/services/workflowService";
import type { StartWorkflowRequest, WorkflowExecution } from "@/types/workflow";

const POLL_INTERVAL_MS = 1500;
const TERMINAL_STATES = new Set(["COMPLETED", "FAILED"]);

export interface WorkflowRunnerState {
  workflow: WorkflowExecution | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
}

export interface WorkflowRunnerActions {
  run: (payload: StartWorkflowRequest) => Promise<void>;
  reset: () => void;
}

export function useWorkflowRunner(): WorkflowRunnerState & WorkflowRunnerActions {
  const [workflow, setWorkflow] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workflowIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (mountedRef.current) setIsPolling(false);
  }, []);

  const poll = useCallback(
    async (id: string) => {
      if (!mountedRef.current) return;
      try {
        const updated = await workflowService.get(id);
        if (!mountedRef.current) return;
        setWorkflow(updated);

        if (TERMINAL_STATES.has(updated.overall_status)) {
          stopPolling();
          return;
        }

        pollTimerRef.current = setTimeout(() => poll(id), POLL_INTERVAL_MS);
      } catch {
        // Silently retry on transient errors; stop on persistent ones
        if (mountedRef.current) {
          pollTimerRef.current = setTimeout(() => poll(id), POLL_INTERVAL_MS * 2);
        }
      }
    },
    [stopPolling],
  );

  const run = useCallback(
    async (payload: StartWorkflowRequest) => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      setIsLoading(true);
      setError(null);
      setWorkflow(null);

      try {
        const initial = await workflowService.start(payload);
        if (!mountedRef.current) return;
        workflowIdRef.current = initial.workflow_id;
        setWorkflow(initial);

        if (!TERMINAL_STATES.has(initial.overall_status)) {
          setIsPolling(true);
          pollTimerRef.current = setTimeout(
            () => poll(initial.workflow_id),
            POLL_INTERVAL_MS,
          );
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [poll],
  );

  const reset = useCallback(() => {
    stopPolling();
    setWorkflow(null);
    setError(null);
    setIsLoading(false);
    workflowIdRef.current = null;
  }, [stopPolling]);

  return { workflow, isLoading, isPolling, error, run, reset };
}