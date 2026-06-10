import { useCallback, useEffect, useRef, useState } from "react";
import { workflowService, APIError } from "@/services/workflowService";
import type { StartWorkflowRequest, WorkflowExecution } from "@/types/workflow";

const POLL_INTERVAL_MS = 1500;
const TERMINAL_STATES = new Set(["COMPLETED", "FAILED"]);
const MAX_CONSECUTIVE_ERRORS = 3;
const BACKOFF_MULTIPLIER = 1.5;

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
  const consecutiveErrorsRef = useRef(0);
  const backoffMultiplierRef = useRef(1);

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
    consecutiveErrorsRef.current = 0;
    backoffMultiplierRef.current = 1;
  }, []);

  const poll = useCallback(
    async (id: string) => {
      if (!mountedRef.current) return;
      try {
        const updated = await workflowService.get(id);
        if (!mountedRef.current) return;

        setWorkflow(updated);
        // Reset error counter on successful poll
        consecutiveErrorsRef.current = 0;
        backoffMultiplierRef.current = 1;

        if (TERMINAL_STATES.has(updated.overall_status)) {
          stopPolling();
          return;
        }

        pollTimerRef.current = setTimeout(
          () => poll(id),
          POLL_INTERVAL_MS,
        );
      } catch (err) {
        if (!mountedRef.current) return;

        const isTransientError =
          err instanceof APIError && err.status !== 404;

        if (isTransientError) {
          consecutiveErrorsRef.current += 1;

          if (
            consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS
          ) {
            const errorMessage =
              err instanceof APIError
                ? err.message
                : "Failed to fetch workflow status after multiple attempts";
            setError(errorMessage);
            stopPolling();
            return;
          }

          // Exponential backoff for transient errors
          const backoffDelay = Math.floor(
            POLL_INTERVAL_MS * Math.pow(BACKOFF_MULTIPLIER, consecutiveErrorsRef.current - 1),
          );
          pollTimerRef.current = setTimeout(() => poll(id), backoffDelay);
        } else {
          // Permanent error (404, 400, etc.)
          const errorMessage =
            err instanceof APIError
              ? err.message
              : "Unknown error occurred";
          setError(errorMessage);
          stopPolling();
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
          consecutiveErrorsRef.current = 0;
          backoffMultiplierRef.current = 1;
          pollTimerRef.current = setTimeout(
            () => poll(initial.workflow_id),
            POLL_INTERVAL_MS,
          );
        }
      } catch (err) {
        if (mountedRef.current) {
          const errorMessage =
            err instanceof APIError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Unknown error occurred";
          setError(errorMessage);
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
    consecutiveErrorsRef.current = 0;
    backoffMultiplierRef.current = 1;
  }, [stopPolling]);

  return { workflow, isLoading, isPolling, error, run, reset };
}