import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Info } from 'lucide-react';
import { agentApi } from '@/services/agentApi';
import { Agent4Response } from '@/types/agent';
import { WorkflowExecution } from '@/types/workflow';
import ResolutionNotesField from './ResolutionNotesField';
import DatafixCodeField from './DatafixCodeField';
import ResolutionSubmissionResult from './ResolutionSubmissionResult';

interface ResolutionSubmissionFormProps {
  workflow: WorkflowExecution;
  onSuccess: () => Promise<void>;
}

interface IncidentSummary {
  short_description?: string;
  state?: string;
  assignment_group?: string;
}

interface Agent1Result {
  incident?: IncidentSummary;
}

interface Agent3Result {
  similar_incidents_found?: boolean;
  next_agent?: string;
}

const ResolutionSubmissionForm: React.FC<ResolutionSubmissionFormProps> = ({ workflow, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [datafix, setDatafix] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<Agent4Response | null>(null);

  const agent3Result = workflow.agent_results?.agent_3 as Agent3Result | undefined;
  const agent1Result = workflow.agent_results?.agent_1 as Agent1Result | undefined;
  const agent1Incident = agent1Result?.incident || {};
  
  const shouldRender = agent3Result?.similar_incidents_found === false && agent3Result?.next_agent === 'agent4';

  if (!shouldRender) return null;

  const validate = () => {
    const trimmed = notes.trim();
    if (!trimmed) {
      setValidationError('Resolution notes are required.');
      return false;
    }
    if (trimmed.length < 20) {
      setValidationError('Please provide more detail (minimum 20 characters).');
      return false;
    }
    if (trimmed.length > 5000) {
      setValidationError('Resolution notes exceed 5000 characters.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await agentApi.submitResolution({
        incident_number: workflow.incident_number,
        resolution_notes: notes.trim(),
        optional_datafix_code: datafix.trim() || undefined,
      });
      
      setResult(response);
      if (response.success) {
        await onSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'A network error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitted = result?.success;

  return (
    <Card className="border-2 border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 pb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl">Technical Resolution Capture</CardTitle>
            <CardDescription>Provide the fix details to update the Knowledge Base.</CardDescription>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold px-2 py-1 bg-white rounded border">{workflow.incident_number}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Incident Summary Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg border border-muted text-sm">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Short Description</label>
            <p className="font-medium leading-tight">{agent1Incident.short_description || 'Loading details...'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">State</label>
            <p className="capitalize">{agent1Incident.state || 'OPEN'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Assignment Group</label>
            <p>{agent1Incident.assignment_group || 'N/A'}</p>
          </div>
        </div>

        <ResolutionSubmissionResult result={result} error={error} />

        <form id="res-submit-form" onSubmit={handleSubmit} className="space-y-6">
          <ResolutionNotesField 
            value={notes} 
            onChange={setNotes} 
            error={validationError || undefined} 
            disabled={loading || isSubmitted}
          />
          <DatafixCodeField 
            value={datafix} 
            onChange={setDatafix} 
            disabled={loading || isSubmitted}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row gap-4 justify-between items-center border-t bg-slate-50/50 p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>This resolution will be searchable for all future incidents.</span>
        </div>
        <Button type="submit" form="res-submit-form" disabled={loading || isSubmitted} className="w-full md:w-auto min-w-[160px]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isSubmitted ? 'Resolution Captured' : 'Submit Resolution'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResolutionSubmissionForm;
