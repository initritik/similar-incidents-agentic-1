import type {
  StartWorkflowRequest,
  WorkflowExecution,
} from "@/types/workflow";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { detail?: string; message?: string }).detail ??
        (body as { message?: string }).message ??
        `Request failed: ${res.status} ${res.statusText}`,
    );
  }

  return res.json() as Promise<T>;
}

export const workflowService = {
  /**
   * Start a new workflow for the given incident number.
   */
  start(payload: StartWorkflowRequest): Promise<WorkflowExecution> {
    return request<WorkflowExecution>("/api/workflows/start", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch the latest state of a workflow by ID.
   */
  get(workflowId: string): Promise<WorkflowExecution> {
    return request<WorkflowExecution>(`/api/workflows/${workflowId}`);
  },
};