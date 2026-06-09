export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface AgentStatus {
  agent_name: string;
  status: WorkflowStatus;
  current_task: string;
  message: string;
  started_at: string;
  completed_at?: string;
}

export interface WorkflowExecution {
  workflow_id: string;
  incident_number: string;
  created_at: string;
  overall_status: WorkflowStatus;
  agent_statuses: AgentStatus[];
  agent_results: Record<string, unknown>;
}

export interface WorkflowStartRequest {
  incident_number: string;
}

export interface WorkflowResponse {
  workflow_id: string;
  incident_number: string;
  created_at: string;
  overall_status: WorkflowStatus;
  agent_statuses: AgentStatus[];
}
