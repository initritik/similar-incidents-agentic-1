// ─── Enums ────────────────────────────────────────────────────────────────────

export type WorkflowStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED";

export type IncidentState = "OPEN" | "WORK_IN_PROGRESS" | "RESOLVED";

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface Incident {
  incident_number: string;
  short_description: string;
  description: string;
  state: IncidentState;
  resolution_notes: string | null;
  created_date: string;
  updated_date: string;
  assignment_group: string;
  assigned_to: string;
}

export interface SimilarIncidentDetail {
  incident_number: string;
  short_description: string;
  description: string;
  state: string;
  resolution_notes: string | null;
  assignment_group: string;
  assigned_to: string;
  similarity_score: number;
  datafix_id: string | null;
  datafix_description: string | null;
  datafix_code: string | null;
}

// ─── Agent Responses ──────────────────────────────────────────────────────────

export interface Agent1Response {
  success: boolean;
  message: string;
  incident: Incident | null;
  missing_fields: string[];
}

export interface Agent2Response {
  success: boolean;
  message: string;
  match_count: number;
  similar_incidents: SimilarIncidentDetail[];
}

export interface Agent3Response {
  success: boolean;
  similar_incidents_found: boolean;
  message: string;
  match_count: number;
  top_matches: SimilarIncidentDetail[];
}

export interface Agent4Response {
  success: boolean;
  message: string;
  saved: boolean;
  saved_incident_number: string | null;
  ingested_to_qdrant: boolean;
  datafix_saved: boolean;
  error: string | null;
}

export interface Agent5Response {
  success: boolean;
  message: string;
  recommended_resolution: string;
  recommended_datafix: string;
  source_incident_numbers: string[];
  source_resolution_notes: string[];
  source_datafix_ids: string[];
  confidence_summary: string;
}

// ─── Workflow Models ──────────────────────────────────────────────────────────

export interface WorkflowAgentStatus {
  agent_name: string;
  status: WorkflowStatus;
  current_task: string;
  started_at: string | null;
  completed_at: string | null;
  message: string;
}

export type AgentResults = {
  agent_1?: Agent1Response;
  agent_2?: Agent2Response;
  agent_3?: Agent3Response;
  agent_4?: Agent4Response;
  agent_5?: Agent5Response;
};

export interface WorkflowExecution {
  workflow_id: string;
  incident_number: string;
  created_at: string;
  overall_status: WorkflowStatus;
  agent_statuses: WorkflowAgentStatus[];
  agent_results: AgentResults;
}

// ─── Request ──────────────────────────────────────────────────────────────────

export interface StartWorkflowRequest {
  incident_number: string;
  provide_resolution?: boolean | null;
  resolution_notes?: string | null;
  datafix_description?: string | null;
  datafix_code?: string | null;
}

// ─── SSE Event payloads ───────────────────────────────────────────────────────

export type SSEEventType =
  | "workflow_created"
  | "agent_status_update"
  | "agent_result"
  | "workflow_done"
  | "error";

export interface SSEAgentStatusUpdate {
  workflow_id: string;
  overall_status: WorkflowStatus;
  agent: WorkflowAgentStatus;
}

export interface SSEAgentResult {
  workflow_id: string;
  agent_name: string;
  agent_key: string;
  result: Agent1Response | Agent2Response | Agent3Response | Agent4Response | Agent5Response;
}