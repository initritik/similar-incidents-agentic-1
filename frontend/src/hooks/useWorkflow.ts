import { useState, useCallback } from 'react';
import { WorkflowExecution } from '../types/workflow';
import { workflowApi } from '../services/workflowApi';
import { ApiError } from '../types/api';

export function useWorkflow() {
  const [workflow, setWorkflow] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startWorkflow = useCallback(async (incidentNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await workflowApi.startWorkflow({ incident_number: incidentNumber });
      setWorkflow(result);
      return result;
    } catch (err) {
      const apiErr = err as ApiError;
      let message: string;
      
      if (typeof apiErr.detail === 'string') {
        message = apiErr.detail;
      } else if (Array.isArray(apiErr.detail)) {
        // Handle Pydantic validation errors (array of error objects)
        message = apiErr.detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
      } else if (apiErr.message) {
        message = apiErr.message;
      } else {
        message = 'Failed to start workflow. Please check the incident number.';
      }
      
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true);
    try {
      const result = await workflowApi.getWorkflow(workflowId);
      setWorkflow(result);
    } catch {
      setError('Failed to refresh workflow status.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    workflow,
    loading,
    error,
    startWorkflow,
    refreshWorkflow,
  };
}
