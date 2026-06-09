import React from 'react';
import { WorkflowExecution } from '../../types/workflow';
import AgentStatusBadge from './AgentStatusBadge';
import AgentResultCard from './AgentResultCard';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ConfidenceScoreCard from '@/components/recommendation/ConfidenceScoreCard';
import DatafixTemplateCard from '@/components/recommendation/DatafixTemplateCard';
import SupportingIncidentsTable from '@/components/recommendation/SupportingIncidentsTable';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AgentTabContentProps {
  agentId: string;
  workflow: WorkflowExecution;
}

interface SimilarIncidentSummary {
  incident_number: string;
  short_description?: string;
  similarity_score: number;
  state?: string;
}

interface SupportingIncidentSummary {
  incident_number: string;
  similarity_score: number;
}

interface AgentResultPayload {
  match_count?: number;
  similar_incidents?: SimilarIncidentSummary[];
  total_matches_found?: number;
  top_similar_incidents?: SimilarIncidentSummary[];
  next_agent?: string;
  knowledge_base_updated?: boolean;
  qdrant_upsert_completed?: boolean;
  resolution_notes?: string;
  optional_datafix_code?: string;
  confidence_score?: number;
  recommended_resolution?: string;
  recommended_datafix_template?: string;
  supporting_incidents?: SupportingIncidentSummary[];
}

const AgentTabContent: React.FC<AgentTabContentProps> = ({ agentId, workflow }) => {
  const agentStatus = workflow.agent_statuses.find(s => s.agent_name.toLowerCase().includes(agentId));
  const result = workflow.agent_results?.[`agent_${agentId}`] as AgentResultPayload | undefined;
  const agent3Result = workflow.agent_results?.agent_3 as AgentResultPayload | undefined;

  if (!agentStatus) return <div className="p-8 text-center text-muted-foreground">Status not found for this agent.</div>;

  const isSkipped = agentStatus.status === 'SKIPPED';
  const isPending = agentStatus.status === 'PENDING';

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Agent {agentId} Execution Result</h3>
          <p className="text-sm text-muted-foreground italic">{agentStatus.current_task}</p>
        </div>
        <AgentStatusBadge status={agentStatus.status} />
      </div>

      <div className="p-4 bg-muted/30 rounded-lg border flex gap-3 items-start">
        <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="text-sm font-medium">Agent Message</p>
          <p className="text-sm text-muted-foreground">{agentStatus.message || 'No specific message returned from agent.'}</p>
        </div>
      </div>

      {isSkipped && agentId === '4' && (
        <div className="p-4 border border-dashed rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Agent 4 was not executed because similar incidents were found.</p>
        </div>
      )}

      {isSkipped && agentId === '5' && (
        <div className="p-4 border border-dashed rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Agent 5 was not executed because no similar incidents were found.</p>
        </div>
      )}

      {!isSkipped && !isPending && result && (
        <div className="space-y-4">
          {/* Agent 1 Specific Content */}
          {agentId === '1' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Incident Number</label>
                <p className="text-sm font-mono">{workflow.incident_number}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Validation Status</label>
                <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Validated
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Mandatory Fields Check</label>
                <div className="text-xs p-2 bg-green-50 border border-green-100 rounded text-green-700">
                  All mandatory fields present: short_description, description, state.
                </div>
              </div>
            </div>
          )}

          {/* Agent 2 Specific Content */}
          {agentId === '2' && (
            <div className="space-y-4">
              <div className="flex gap-8">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Match Count</label>
                  <p className="text-xl font-bold">{result.match_count || 0}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Similarity Score Range</label>
                  <p className="text-xl font-bold">{((result.similar_incidents?.[0]?.similarity_score || 0) * 100).toFixed(1)}% Max</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">Found Incident IDs</label>
                <div className="flex flex-wrap gap-2">
                  {result.similar_incidents?.map((inc) => (
                    <Badge key={inc.incident_number} variant="secondary">{inc.incident_number}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Agent 3 Specific Content */}
          {agentId === '3' && (
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-blue-50 border border-blue-100 rounded-md">
                <div className="text-sm"><span className="font-bold">Total Matches:</span> {result.total_matches_found}</div>
                <div className="text-sm font-bold text-blue-700">Next Agent: {result.next_agent}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">Top Relevant Matches</label>
                <ScrollArea className="h-[200px] pr-4">
                  {result.top_similar_incidents?.map((inc) => (
                    <AgentResultCard 
                      key={inc.incident_number}
                      incidentNumber={inc.incident_number}
                      title={inc.short_description || inc.incident_number}
                      score={inc.similarity_score}
                      state={inc.state}
                    />
                  ))}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Agent 4 Specific Content */}
          {agentId === '4' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">KB Updated</label>
                <p className="text-sm">{result.knowledge_base_updated ? 'Yes' : 'No'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Qdrant Upsert</label>
                <p className="text-sm font-medium">{result.qdrant_upsert_completed ? 'Completed' : 'Failed'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Resolution Notes</label>
                <div className="mt-1 p-3 bg-muted rounded border text-xs">{result.resolution_notes || 'N/A'}</div>
              </div>
              {result.optional_datafix_code && (
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Submitted Datafix Code</label>
                  <pre className="mt-1 p-3 bg-slate-900 text-slate-50 rounded border text-[10px] overflow-x-auto">
                    <code>{result.optional_datafix_code}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Agent 5 Specific Content */}
          {agentId === '5' && (
            <div className="space-y-4">
              <ConfidenceScoreCard score={result.confidence_score || 0} />
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Recommended Resolution</label>
                <p className="text-sm p-3 border rounded bg-white shadow-sm">{result.recommended_resolution}</p>
              </div>
              <DatafixTemplateCard template={result.recommended_datafix_template || ''} />
              <Separator />
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">Supporting Evidence</label>
                <SupportingIncidentsTable incidents={(result.supporting_incidents || []).map((support) => ({
                  ...support,
                  ...agent3Result?.top_similar_incidents?.find((incident) => incident.incident_number === support.incident_number)
                }))} />
              </div>
            </div>
          )}
        </div>
      )}

      {(!result || isPending) && !isSkipped && (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed rounded-lg">
          {agentStatus.status === 'FAILED' ? (
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          ) : (
            <Info className="h-8 w-8 mb-2 opacity-20" />
          )}
          <p className="text-sm">No detailed result data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default AgentTabContent;
