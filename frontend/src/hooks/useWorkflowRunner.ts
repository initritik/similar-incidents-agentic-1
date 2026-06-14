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
  /**
   * True when Agent 3 completed with no similar incidents found (all scores < 50%)
   * and the workflow is waiting for the user to provide a resolution via Agent 4.
   */
  needsResolutionCapture: boolean;
  /** True while the resolution capture re-submission is in progress */
  isCaptureLoading: boolean;
}

export interface WorkflowRunnerActions {
  run: (payload: StartWorkflowRequest) => void;
  /** Submit resolution notes + optional datafix to complete the Agent 4 capture */
  submitResolutionCapture: (payload: StartWorkflowRequest) => void;
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

/**
 * Determine whether a completed workflow needs the user to provide a resolution.
 *
 * Condition:
 *   - Agent 3 completed with similar_incidents_found = false  (no match ≥ 50%)
 *   - Agent 4 has NOT yet saved a resolution
 *   - Agent 4 is either PENDING or was SKIPPED with an "awaiting user input" message
 *     (the orchestrator skips Agent 4 on the first run when no resolution data is
 *      provided, then waits for the frontend to re-submit with resolution notes)
 *
 * NOTE: When Agent 4 is SKIPPED because *similar incidents were found* (and Agent 5
 * handles the recommendation), its skip message says "similar incident(s) found" —
 * that case must NOT trigger the capture form, so we check the message text.
 */
function detectNeedsCapture(workflow: WorkflowExecution | null): boolean {
  if (!workflow) return false;
  // Must be in a terminal state
  if (
    workflow.overall_status !== "COMPLETED" &&
    workflow.overall_status !== "FAILED"
  )
    return false;

  const agent3Result = workflow.agent_results?.agent_3;
  const agent4Result = workflow.agent_results?.agent_4;
  const agent4Status = workflow.agent_statuses.find(
    (a) => a.agent_name === "Agent 4",
  );

  // Agent 3 must have run and found NO similar incidents
  const noSimilarIncidents =
    agent3Result?.success === true &&
    agent3Result?.similar_incidents_found === false;

  if (!noSimilarIncidents) return false;

  // Agent 4 must NOT have successfully saved a resolution yet
  const agent4NotSaved = !agent4Result || agent4Result.saved === false;

  // Agent 4 is "awaiting input" when:
  //   a) It was SKIPPED by the orchestrator with the sentinel "awaiting user input" message
  //   b) It is still PENDING (shouldn't normally happen at terminal state, but guard it)
  const agent4AwaitingInput =
    agent4Status?.status === "SKIPPED" &&
    (agent4Status.message?.toLowerCase().includes("awaiting user input") ??
      false);

  const agent4Pending = agent4Status?.status === "PENDING";

  return agent4NotSaved && (agent4AwaitingInput || agent4Pending);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWorkflowRunner(): WorkflowRunnerState & WorkflowRunnerActions {
  const [workflow, setWorkflow] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentLogs>(emptyLogs());
  const [isCaptureLoading, setIsCaptureLoading] = useState(false);

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
    (
      agentName: string,
      updatedStatus: WorkflowAgentStatus,
      overallStatus: WorkflowExecution["overall_status"],
    ) => {
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
      const incidentRegex = /^(?:INC\d{6}|SCTASK\d+)$/i;
      if (!incidentRegex.test(payload.incident_number)) {
        setError(
          "Invalid ticket identifier. Expected format: INC000001 or SCTASK005.",
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

  /**
   * Phase-2 submission: user has filled in resolution notes (and optional datafix).
   * We re-run the full workflow with the resolution data; the orchestrator will
   * route through Agent 4 which will now have the data it needs to ingest.
   */
  const submitResolutionCapture = useCallback(
    (payload: StartWorkflowRequest) => {
      cancelRef.current?.();
      cancelRef.current = null;

      if (!mountedRef.current) return;

      setIsCaptureLoading(true);
      setError(null);

      // Preserve existing agent logs; reset only Agent 4 / 5 logs for the re-run
      setAgentLogs((prev) => ({
        ...prev,
        "Agent 4": [],
        "Agent 5": [],
      }));

      // Keep the existing workflow display but reset Agent 4/5 statuses to PENDING
      setWorkflow((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          overall_status: "RUNNING",
          agent_statuses: prev.agent_statuses.map((a) => {
            if (a.agent_name === "Agent 4" || a.agent_name === "Agent 5") {
              return {
                ...a,
                status: "PENDING" as const,
                message: "Waiting to start.",
                current_task: "",
              };
            }
            return a;
          }),
          // Clear previous agent 4 result so the form disappears
          agent_results: {
            ...prev.agent_results,
            agent_4: undefined,
            agent_5: undefined,
          } as AgentResults,
        };
      });

      const cancel = workflowService.stream(payload, {
        onAgentStatusUpdate: (data) => {
          if (!mountedRef.current) return;
          setIsCaptureLoading(false);
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
          setIsCaptureLoading(false);
        },

        onError: (message) => {
          if (!mountedRef.current) return;
          setError(message);
          setIsStreaming(false);
          setIsLoading(false);
          setIsCaptureLoading(false);
        },
      });

      const loadingTimeout = setTimeout(() => {
        if (mountedRef.current) setIsCaptureLoading(false);
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
    setIsCaptureLoading(false);
    setAgentLogs(emptyLogs());
  }, []);

  const needsResolutionCapture = detectNeedsCapture(workflow);

  return {
    workflow,
    isLoading,
    isStreaming,
    error,
    agentLogs,
    needsResolutionCapture,
    isCaptureLoading,
    run,
    submitResolutionCapture,
    reset,
  };
}