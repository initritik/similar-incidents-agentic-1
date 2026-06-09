import { apiClient } from "@/services/apiClient";
import type { WorkflowExecution, WorkflowStartRequest } from "@/types/workflow";

export const workflowApi = {
  startWorkflow: (request: WorkflowStartRequest) =>
    apiClient.post<WorkflowExecution>("/api/workflows/start", request),
  getWorkflow: (workflowId: string) =>
    apiClient.get<WorkflowExecution>(`/api/workflows/${workflowId}`),
};
