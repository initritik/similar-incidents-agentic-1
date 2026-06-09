export interface Agent4ResolutionRequest {
  incident_number: string;
  resolution_notes: string;
  optional_datafix_code?: string;
}

export interface Agent4Response {
  success: boolean;
  message: string;
  incident_number: string;
  knowledge_base_updated: boolean;
  qdrant_upsert_completed: boolean;
}

export interface SupportingIncident {
  incident_number: string;
  similarity_score: number;
}

export interface Agent5Response {
  success: boolean;
  message: string;
  recommended_resolution: string;
  recommended_datafix_template: string;
  confidence_score: number;
  supporting_incidents: SupportingIncident[];
}

export type AgentResponse = Agent4Response | Agent5Response;