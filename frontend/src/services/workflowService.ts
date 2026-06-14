import type {
  StartWorkflowRequest,
  WorkflowExecution,
  SSEEventType,
  SSEAgentStatusUpdate,
  SSEAgentResult,
} from "@/types/workflow";
import {
  normalizeWorkflow,
  extractErrorMessage,
} from "@/utils/dataMappers";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Custom error class for API errors with structured error information.
 */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Make a type-safe API request with comprehensive error handling.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new APIError(0, `Network error: ${message}`, err);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = extractErrorMessage(body);
    throw new APIError(res.status, message, body);
  }

  return body as T;
}

// ── SSE streaming callbacks ───────────────────────────────────────────────────

export interface SSECallbacks {
  onAgentStatusUpdate?: (data: SSEAgentStatusUpdate) => void;
  onAgentResult?: (data: SSEAgentResult) => void;
  onWorkflowDone?: (data: WorkflowExecution) => void;
  onError?: (message: string) => void;
}

/**
 * Start the workflow pipeline and consume Server-Sent Events.
 *
 * Returns a cancel function — call it to abort the stream early.
 */
function streamWorkflow(
  payload: StartWorkflowRequest,
  callbacks: SSECallbacks,
): () => void {
  const controller = new AbortController();

  (async () => {
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/api/workflows/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          incident_number: payload.incident_number.toUpperCase(),
        }),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        callbacks.onError?.("Network error: " + (err instanceof Error ? err.message : String(err)));
      }
      return;
    }

    if (!res.ok || !res.body) {
      const body = await res.json().catch(() => null);
      callbacks.onError?.(extractErrorMessage(body) || `HTTP ${res.status}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      let done: boolean;
      let value: Uint8Array | undefined;

      try {
        ({ done, value } = await reader.read());
      } catch {
        break;
      }

      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by double newlines
      const messages = buffer.split(/\n\n/);
      buffer = messages.pop() ?? "";

      for (const raw of messages) {
        if (!raw.trim()) continue;

        let eventType: SSEEventType = "agent_status_update";
        let dataStr = "";

        for (const line of raw.split("\n")) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim() as SSEEventType;
          } else if (line.startsWith("data: ")) {
            dataStr = line.slice(6).trim();
          }
        }

        if (!dataStr) continue;

        let parsed: unknown;
        try {
          parsed = JSON.parse(dataStr);
        } catch {
          continue;
        }

        switch (eventType) {
          case "agent_status_update":
            callbacks.onAgentStatusUpdate?.(parsed as SSEAgentStatusUpdate);
            break;
          case "agent_result":
            callbacks.onAgentResult?.(parsed as SSEAgentResult);
            break;
          case "workflow_done":
            callbacks.onWorkflowDone?.(normalizeWorkflow(parsed as WorkflowExecution));
            break;
          case "error":
            callbacks.onError?.((parsed as { message: string }).message ?? "Unknown stream error");
            break;
          default:
            break;
        }
      }
    }
  })();

  return () => controller.abort();
}

export const workflowService = {
  /**
   * Start a new workflow for the given incident number (non-streaming, returns final state).
   */
  async start(payload: StartWorkflowRequest): Promise<WorkflowExecution> {
    const incidentRegex = /^(?:INC\d{6}|SCTASK\d+)$/i;
    if (!incidentRegex.test(payload.incident_number.toUpperCase())) {
      throw new APIError(
        400,
        "Invalid ticket identifier. Expected format: INC000001 or SCTASK005.",
      );
    }

    try {
      const response = await request<WorkflowExecution>(
        "/api/workflows/start",
        {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            incident_number: payload.incident_number.toUpperCase(),
          }),
        },
      );
      return normalizeWorkflow(response);
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError(500, "Failed to start workflow", err);
    }
  },

  /**
   * Fetch the latest state of a workflow by ID.
   */
  async get(workflowId: string): Promise<WorkflowExecution> {
    if (!workflowId || typeof workflowId !== "string") {
      throw new APIError(400, "Invalid workflow ID");
    }

    try {
      const response = await request<WorkflowExecution>(
        `/api/workflows/${encodeURIComponent(workflowId)}`,
      );
      return normalizeWorkflow(response);
    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 404) {
          throw new APIError(
            404,
            `Workflow ${workflowId} not found. It may have expired.`,
            err.detail,
          );
        }
        throw err;
      }
      throw new APIError(500, "Failed to fetch workflow status", err);
    }
  },

  /**
   * Stream a workflow via SSE. Returns a cancel function.
   */
  stream: streamWorkflow,
};