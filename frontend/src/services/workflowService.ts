import type {
  StartWorkflowRequest,
  WorkflowExecution,
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
    // Network or fetch error
    const message = err instanceof Error ? err.message : "Network error";
    throw new APIError(0, `Network error: ${message}`, err);
  }

  // Parse response body
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  // Handle error responses
  if (!res.ok) {
    const message = extractErrorMessage(body);
    throw new APIError(res.status, message, body);
  }

  return body as T;
}

export const workflowService = {
  /**
   * Start a new workflow for the given incident number.
   *
   * @param payload StartWorkflowRequest with incident_number
   * @returns WorkflowExecution with initial state and workflow_id
   * @throws APIError on validation or server errors
   */
  async start(payload: StartWorkflowRequest): Promise<WorkflowExecution> {
    // Validate incident number locally first
    const incidentRegex = /^INC\d{6}$/;
    if (!incidentRegex.test(payload.incident_number.toUpperCase())) {
      throw new APIError(
        400,
        "Invalid incident identifier. Expected format: INC followed by 6 digits (e.g., INC000001).",
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

      // Normalize the workflow response to ensure all fields are properly typed
      return normalizeWorkflow(response);
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        500,
        "Failed to start workflow",
        err,
      );
    }
  },

  /**
   * Fetch the latest state of a workflow by ID.
   *
   * @param workflowId UUID of the workflow
   * @returns WorkflowExecution with current state
   * @throws APIError if workflow not found or fetch fails
   */
  async get(workflowId: string): Promise<WorkflowExecution> {
    if (!workflowId || typeof workflowId !== "string") {
      throw new APIError(400, "Invalid workflow ID");
    }

    try {
      const response = await request<WorkflowExecution>(
        `/api/workflows/${encodeURIComponent(workflowId)}`,
      );

      // Normalize the workflow response
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
      throw new APIError(
        500,
        "Failed to fetch workflow status",
        err,
      );
    }
  },
};