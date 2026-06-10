/**
 * POLLING & ERROR HANDLING BEHAVIOR
 * 
 * This document describes the polling behavior for workflow execution.
 */

export const POLLING_CONFIG = {
  /**
   * Initial poll interval in milliseconds.
   * First poll happens after this delay once workflow is started.
   */
  INITIAL_INTERVAL_MS: 1500,

  /**
   * Terminal states where polling should stop.
   * The frontend stops polling and shows final results.
   */
  TERMINAL_STATES: ["COMPLETED", "FAILED"] as const,

  /**
   * Maximum number of consecutive transient errors before giving up.
   * Transient errors (500, network errors) will retry with backoff.
   * Permanent errors (404, 400) stop polling immediately.
   */
  MAX_CONSECUTIVE_ERRORS: 3,

  /**
   * Backoff multiplier for exponential backoff strategy.
   * Each retry after a transient error multiplies the delay by this factor.
   * Example: 1500ms * 1.5^1 = 2250ms, 1500ms * 1.5^2 = 3375ms, etc.
   */
  BACKOFF_MULTIPLIER: 1.5 as const,
};

/**
 * POLLING SCENARIOS
 * 
 * 1. SUCCESS PATH
 *    - Start workflow
 *    - Poll at 1500ms intervals
 *    - Workflow status updates through agents
 *    - Final COMPLETED or FAILED status reached
 *    - Polling stops, results displayed
 * 
 * 2. TRANSIENT ERROR (network timeout, 500 error)
 *    - Poll fails with transient error
 *    - Error counter incremented
 *    - Next poll scheduled with backoff delay
 *    - If error_count < MAX_CONSECUTIVE_ERRORS, retry
 *    - Else: Show error, stop polling
 * 
 * 3. PERMANENT ERROR (404, 400)
 *    - Poll fails with permanent error
 *    - Error displayed immediately
 *    - Polling stops
 * 
 * 4. WORKFLOW NOT FOUND
 *    - Workflow ID is invalid or workflow has expired
 *    - Shows "Workflow not found" error
 *    - Polling stops
 */

/**
 * WORKFLOW STATUSES
 * 
 * PENDING: Waiting to start
 * RUNNING: Currently executing an agent
 * COMPLETED: All agents finished successfully
 * FAILED: An agent or workflow failed
 * SKIPPED: Agent was intentionally skipped (e.g., Agent 4/5 mutual exclusivity)
 */
