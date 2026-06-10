/**
 * Data mapping utilities to transform backend responses into UI-friendly structures.
 * Handles edge cases, null values, and ensures consistent data shapes.
 */

import type {
  WorkflowExecution,
  WorkflowAgentStatus,
  Agent1Response,
  Agent2Response,
  Agent3Response,
  Agent4Response,
  Agent5Response,
  Incident,
} from "@/types/workflow";

/**
 * Ensure an agent status has all required fields and defaults for missing values.
 */
export function normalizeAgentStatus(
  status: WorkflowAgentStatus,
): WorkflowAgentStatus {
  return {
    agent_name: status.agent_name || "Unknown",
    status: status.status || "PENDING",
    current_task: status.current_task || "",
    started_at: status.started_at || null,
    completed_at: status.completed_at || null,
    message: status.message || "",
  };
}

/**
 * Normalize an Agent1 response, handling missing fields.
 */
export function normalizeAgent1Response(
  response: unknown,
): Agent1Response | null {
  if (!response || typeof response !== "object") return null;

  const obj = response as Record<string, unknown>;
  return {
    success: Boolean(obj.success),
    message: String(obj.message || ""),
    incident: normalizeIncident(obj.incident as unknown) || null,
    missing_fields: Array.isArray(obj.missing_fields)
      ? (obj.missing_fields as string[])
      : [],
  };
}

/**
 * Normalize an Agent2 response, handling missing fields and lists.
 */
export function normalizeAgent2Response(
  response: unknown,
): Agent2Response | null {
  if (!response || typeof response !== "object") return null;

  const obj = response as Record<string, unknown>;
  return {
    success: Boolean(obj.success),
    message: String(obj.message || ""),
    match_count: Number(obj.match_count || 0),
    similar_incidents: Array.isArray(obj.similar_incidents)
      ? (obj.similar_incidents as unknown[])
          .map((inc) => normalizeSimilarIncident(inc))
          .filter(Boolean)
      : [],
  };
}

/**
 * Normalize an Agent3 response with proper field handling.
 */
export function normalizeAgent3Response(
  response: unknown,
): Agent3Response | null {
  if (!response || typeof response !== "object") return null;

  const obj = response as Record<string, unknown>;
  return {
    success: Boolean(obj.success),
    similar_incidents_found: Boolean(obj.similar_incidents_found),
    message: String(obj.message || ""),
    match_count: Number(obj.match_count || 0),
    top_matches: Array.isArray(obj.top_matches)
      ? (obj.top_matches as unknown[])
          .map((inc) => normalizeSimilarIncident(inc))
          .filter(Boolean)
      : [],
  };
}

/**
 * Normalize an Agent4 response, handling optional fields.
 */
export function normalizeAgent4Response(
  response: unknown,
): Agent4Response | null {
  if (!response || typeof response !== "object") return null;

  const obj = response as Record<string, unknown>;
  return {
    success: Boolean(obj.success),
    message: String(obj.message || ""),
    saved: Boolean(obj.saved),
    saved_incident_number: obj.saved_incident_number
      ? String(obj.saved_incident_number)
      : null,
    ingested_to_qdrant: Boolean(obj.ingested_to_qdrant),
    datafix_saved: Boolean(obj.datafix_saved),
    error: obj.error ? String(obj.error) : null,
  };
}

/**
 * Normalize an Agent5 response with comprehensive field handling.
 */
export function normalizeAgent5Response(
  response: unknown,
): Agent5Response | null {
  if (!response || typeof response !== "object") return null;

  const obj = response as Record<string, unknown>;
  return {
    success: Boolean(obj.success),
    message: String(obj.message || ""),
    recommended_resolution: String(obj.recommended_resolution || ""),
    recommended_datafix: String(obj.recommended_datafix || ""),
    source_incident_numbers: Array.isArray(obj.source_incident_numbers)
      ? (obj.source_incident_numbers as unknown[]).map(String)
      : [],
    source_resolution_notes: Array.isArray(obj.source_resolution_notes)
      ? (obj.source_resolution_notes as unknown[]).map(String)
      : [],
    source_datafix_ids: Array.isArray(obj.source_datafix_ids)
      ? (obj.source_datafix_ids as unknown[]).map(String)
      : [],
    confidence_summary: String(obj.confidence_summary || ""),
  };
}

/**
 * Normalize an Incident model, ensuring all fields are present.
 */
export function normalizeIncident(incident: unknown): Incident | null {
  if (!incident || typeof incident !== "object") return null;

  const obj = incident as Record<string, unknown>;
  // Skip normalization if critical fields are missing
  if (!obj.incident_number || !obj.state) return null;

  return {
    incident_number: String(obj.incident_number),
    short_description: String(obj.short_description || ""),
    description: String(obj.description || ""),
    state: String(obj.state) as "OPEN" | "WORK_IN_PROGRESS" | "RESOLVED",
    resolution_notes: obj.resolution_notes ? String(obj.resolution_notes) : null,
    created_date: String(obj.created_date || ""),
    updated_date: String(obj.updated_date || ""),
    assignment_group: String(obj.assignment_group || ""),
    assigned_to: String(obj.assigned_to || ""),
  };
}

/**
 * Normalize a similar incident detail, handling all optional fields.
 */
export function normalizeSimilarIncident(inc: unknown) {
  if (!inc || typeof inc !== "object") return null;

  const obj = inc as Record<string, unknown>;
  if (!obj.incident_number) return null;

  return {
    incident_number: String(obj.incident_number),
    short_description: String(obj.short_description || ""),
    description: String(obj.description || ""),
    state: String(obj.state || ""),
    resolution_notes: obj.resolution_notes ? String(obj.resolution_notes) : null,
    assignment_group: String(obj.assignment_group || ""),
    assigned_to: String(obj.assigned_to || ""),
    similarity_score: Number(obj.similarity_score || 0),
    datafix_id: obj.datafix_id ? String(obj.datafix_id) : null,
    datafix_description: obj.datafix_description
      ? String(obj.datafix_description)
      : null,
    datafix_code: obj.datafix_code ? String(obj.datafix_code) : null,
  };
}

/**
 * Normalize a complete workflow execution response, ensuring all agents are normalized.
 */
export function normalizeWorkflow(workflow: WorkflowExecution): WorkflowExecution {
  return {
    ...workflow,
    agent_statuses: workflow.agent_statuses.map(normalizeAgentStatus),
    agent_results: {
      agent_1: workflow.agent_results.agent_1
        ? normalizeAgent1Response(workflow.agent_results.agent_1)
        : undefined,
      agent_2: workflow.agent_results.agent_2
        ? normalizeAgent2Response(workflow.agent_results.agent_2)
        : undefined,
      agent_3: workflow.agent_results.agent_3
        ? normalizeAgent3Response(workflow.agent_results.agent_3)
        : undefined,
      agent_4: workflow.agent_results.agent_4
        ? normalizeAgent4Response(workflow.agent_results.agent_4)
        : undefined,
      agent_5: workflow.agent_results.agent_5
        ? normalizeAgent5Response(workflow.agent_results.agent_5)
        : undefined,
    },
  };
}

/**
 * Get a user-friendly error message from various error sources.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    if (obj.detail && typeof obj.detail === "string") {
      return obj.detail;
    }
    if (obj.message && typeof obj.message === "string") {
      return obj.message;
    }
  }

  return "An unexpected error occurred. Please try again.";
}
