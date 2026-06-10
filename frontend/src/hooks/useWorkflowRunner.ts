import { useCallback, useEffect, useRef, useState } from "react";
import { workflowService, APIError } from "@/services/workflowService";
import type {
  StartWorkflowRequest,
  WorkflowExecution,
  WorkflowAgentStatus,
  AgentResults,
} from "@/types/workflow";

// ── Streaming log entry ───────────────────────────────────────────────────────

export interface AgentLogEntry {
  /** ISO timestamp */
  ts: string;
  /** Human-readable message from the agent */
  message: string;
  /** The task description at the time of the entry */
  current_task: string;
  /** The status at the time of the entry */
  status: WorkflowAgentStatus["status"];
}

/** Live feed of log entries keyed by agent_name ("Agent 1" … "Agent 5") */
export type AgentLogs = Record<string, AgentLogEntry[]>;

// ── Hook state / actions ──────────────────────────────────────────────────────

export interface WorkflowRunnerState {
  workflow: WorkflowExecution | null;
  /** True while the SSE stream is open */
  isStreaming: boolean;
  /** True while sending the initial POST */
  isLoading: boolean;
  error: string | null;
  /** Real-time log entries per agent */
  agentLogs: AgentLogs;
}

export interface WorkflowRunnerActions {
  run: (payload: StartWorkflowRequest) => void;
  reset: () => void;
}

// ── Initial values ────────────────────────────────────────────────────────────

const AGENT_NAMES = ["Agent 1", "Agent 2", "Agent 3", "Agent 4", "Agent 5"];

function emptyLogs(): AgentLogs {
  return Object.fromEntries(AGENT_NAMES.map((n) => [n, []]));
}

function initialPendingWorkflow(incidentNumber: string): WorkflowExecution {
  return {
    workflow_id: "",
    incident_number: incidentNumber,
    created_at: new Date().toISOString(),
    overall_status: "PENDING",
    agent_statuses: AGENT_NAMES.map((name) => ({
      agent_name: name,
      status: "PENDING",
      current_task: "",
      started_at: null,
      completed_at: null,
      message: "Waiting to start.",
    })),
    agent_results: {},
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWorkflowRunner(): WorkflowRunnerState & WorkflowRunnerActions {
  const [workflow, setWorkflow] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentLogs>(emptyLogs());

  const cancelRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelRef.current?.();
    };
  }, []);

  /** Append a log entry for a specific agent. */
  const appendLog = useCallback(
    (agentName: string, entry: Omit<AgentLogEntry, "ts">) => {
      if (!mountedRef.current) return;
      setAgentLogs((prev) => ({
        ...prev,
        [agentName]: [
          ...(prev[agentName] ?? []),
          { ...entry, ts: new Date().toISOString() },
        ],
      }));
    },
    [],
  );

  /** Merge an agent-status update into the local workflow state. */
  const applyAgentStatusUpdate = useCallback(
    (agentName: string, updatedStatus: WorkflowAgentStatus, overallStatus: WorkflowExecution["overall_status"]) => {
      if (!mountedRef.current) return;
      setWorkflow((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          overall_status: overallStatus,
          agent_statuses: prev.agent_statuses.map((a) =>
            a.agent_name === agentName ? { ...a, ...updatedStatus } : a,
          ),
        };
      });
    },
    [],
  );

  /** Merge an agent result into the local workflow state. */
  const applyAgentResult = useCallback(
    (agentKey: string, result: AgentResults[keyof AgentResults]) => {
      if (!mountedRef.current) return;
      setWorkflow((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          agent_results: {
            ...prev.agent_results,
            [agentKey]: result,
          } as AgentResults,
        };
      });
    },
    [],
  );

  const run = useCallback(
    (payload: StartWorkflowRequest) => {
      // Cancel any previous stream
      cancelRef.current?.();
      cancelRef.current = null;

      if (!mountedRef.current) return;

      // Validate locally before streaming
      const incidentRegex = /^INC\d{6}$/i;
      if (!incidentRegex.test(payload.incident_number)) {
        setError(
          "Invalid incident identifier. Expected format: INC followed by 6 digits (e.g., INC000001).",
        );
        return;
      }

      setIsLoading(true);
      setError(null);
      setAgentLogs(emptyLogs());
      setWorkflow(initialPendingWorkflow(payload.incident_number.toUpperCase()));

      const cancel = workflowService.stream(payload, {
        onAgentStatusUpdate: (data) => {
          if (!mountedRef.current) return;

          // First real event — mark loading done, streaming started
          setIsLoading(false);
          setIsStreaming(true);

          applyAgentStatusUpdate(
            data.agent.agent_name,
            data.agent,
            data.overall_status,
          );

          appendLog(data.agent.agent_name, {
            message: data.agent.message,
            current_task: data.agent.current_task,
            status: data.agent.status,
          });
        },

        onAgentResult: (data) => {
          if (!mountedRef.current) return;
          applyAgentResult(
            data.agent_key,
            data.result as AgentResults[keyof AgentResults],
          );
        },

        onWorkflowDone: (finalWorkflow) => {
          if (!mountedRef.current) return;
          setWorkflow(finalWorkflow);
          setIsStreaming(false);
          setIsLoading(false);
        },

        onError: (message) => {
          if (!mountedRef.current) return;
          setError(message);
          setIsStreaming(false);
          setIsLoading(false);
        },
      });

      // If we don't get the first SSE within 10 s, time out loading state
      const loadingTimeout = setTimeout(() => {
        if (mountedRef.current) setIsLoading(false);
      }, 10_000);

      cancelRef.current = () => {
        cancel();
        clearTimeout(loadingTimeout);
      };
    },
    [applyAgentStatusUpdate, applyAgentResult, appendLog],
  );

  const reset = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    if (!mountedRef.current) return;
    setWorkflow(null);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
    setAgentLogs(emptyLogs());
  }, []);

  return {
    workflow,
    isLoading,
    isStreaming,
    error,
    agentLogs,
    run,
    reset,
  };
}