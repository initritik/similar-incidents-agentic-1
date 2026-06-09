import { apiClient } from "@/services/apiClient";
import type { Agent4ResolutionRequest, Agent4Response } from "@/types/agent";

export const agentApi = {
  submitResolution: (request: Agent4ResolutionRequest) =>
    apiClient.post<Agent4Response>("/api/agents/agent4/submit-resolution", request),
};
