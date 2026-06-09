import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WorkflowDiagram from '@/components/workflow/WorkflowDiagram';
import AgentTabs from '@/components/agent-tabs/AgentTabs';
import ResolutionSubmissionForm from '@/components/resolution/ResolutionSubmissionForm';
import RecommendationPanel from '@/components/recommendation/RecommendationPanel';
import { Loader2, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

const IncidentResolutionPage: React.FC = () => {
  const [incidentInput, setIncidentInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { workflow, loading, error, startWorkflow, refreshWorkflow } = useWorkflow();

  const validateIncidentNumber = (value: string): boolean => {
    const regex = /^INC\d{6}$/;
    if (!regex.test(value)) {
      setValidationError('Incident number must follow the format: INC followed by 6 digits (e.g., INC000001)');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateIncidentNumber(incidentInput)) {
      try {
        await startWorkflow(incidentInput);
      } catch {
        // Error is handled by the hook
      }
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Incident Resolution</h1>
        <p className="text-muted-foreground">
          Enter an incident number to trigger the automated resolution workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trigger Workflow</CardTitle>
          <CardDescription>Validates data, searches for similarities, and generates recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Input
                placeholder="e.g. INC000001"
                value={incidentInput}
                onChange={(e) => setIncidentInput(e.target.value.toUpperCase())}
                disabled={loading}
                className={validationError ? 'border-destructive' : ''}
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Run Analysis
              </Button>
            </div>
            {validationError && (
              <p className="text-sm font-medium text-destructive">{validationError}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <WorkflowDiagram workflow={workflow} />

      {workflow && (
        <ResolutionSubmissionForm 
          workflow={workflow} 
          onSuccess={async () => {
            await refreshWorkflow(workflow.workflow_id);
          }} 
        />
      )}

      {workflow && (
        <RecommendationPanel workflow={workflow} />
      )}

      <AgentTabs workflow={workflow} />

      {workflow && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Workflow Results: {workflow.incident_number}</CardTitle>
                <CardDescription>ID: {workflow.workflow_id}</CardDescription>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {workflow.overall_status}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Agent Execution Status</h3>
              <div className="grid gap-4">
                {workflow.agent_statuses.map((agent) => (
                  <div key={agent.agent_name} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      {agent.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : agent.status === 'FAILED' ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                      )}
                      <div>
                        <p className="font-medium">{agent.agent_name}</p>
                        <p className="text-sm text-muted-foreground">{agent.message}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{agent.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncidentResolutionPage;
