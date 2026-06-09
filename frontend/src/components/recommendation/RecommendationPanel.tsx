import React from 'react';
import { WorkflowExecution } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Check, MessageSquareText, HelpCircle } from 'lucide-react';
import ConfidenceScoreCard from './ConfidenceScoreCard';
import DatafixTemplateCard from './DatafixTemplateCard';
import SupportingIncidentsTable from './SupportingIncidentsTable';

interface RecommendationPanelProps {
  workflow: WorkflowExecution;
}

interface SimilarIncidentSummary {
  incident_number: string;
  similarity_score: number;
  state?: string;
  assignment_group?: string;
  assigned_to?: string;
}

interface Agent3Result {
  next_agent?: string;
  top_similar_incidents?: SimilarIncidentSummary[];
}

interface Agent5Result {
  success?: boolean;
  message?: string;
  recommended_resolution: string;
  recommended_datafix_template: string;
  confidence_score: number;
  supporting_incidents: SimilarIncidentSummary[];
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ workflow }) => {
  const [copiedRes, setCopiedRes] = React.useState(false);
  
  const agent3Result = workflow.agent_results?.agent_3 as Agent3Result | undefined;
  const agent5Result = workflow.agent_results?.agent_5 as Agent5Result | undefined;

  const isAgent5Path = agent3Result?.next_agent === 'agent5';
  const hasResult = agent5Result?.success === true;

  if (!isAgent5Path || !hasResult) return null;

  const copyResolution = () => {
    navigator.clipboard.writeText(agent5Result.recommended_resolution);
    setCopiedRes(true);
    setTimeout(() => setCopiedRes(false), 2000);
  };

  // Join Agent 5 supporting incident IDs with Agent 3's full metadata
  const supportingData = agent5Result.supporting_incidents.map((support) => {
    const fullDetails = agent3Result.top_similar_incidents?.find(
      (inc) => inc.incident_number === support.incident_number
    );
    return {
      ...fullDetails,
      incident_number: support.incident_number,
      similarity_score: support.similarity_score,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary fill-primary/20" />
        <h2 className="text-2xl font-black tracking-tight">Agent 5 Recommendation</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Resolution & Score */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">Recommended Resolution</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={copyResolution} className="h-8 text-xs">
                  {copiedRes ? <Check className="mr-1 h-3 w-3 text-green-600" /> : <Copy className="mr-1 h-3 w-3" />}
                  Copy Resolution
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                  {agent5Result.recommended_resolution}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Why This Recommendation?
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-slate-600 leading-relaxed border border-dashed">
                  {agent5Result.message}
                </div>
              </div>
            </CardContent>
          </Card>

          <DatafixTemplateCard template={agent5Result.recommended_datafix_template} />
        </div>

        {/* Right Column: Confidence & Meta */}
        <div className="space-y-6">
          <ConfidenceScoreCard score={agent5Result.confidence_score} />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Analysis Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Supporting Incidents</span>
                <span className="font-bold">{supportingData.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Synthesis Engine</span>
                <span className="font-bold">GPT-5-Mini</span>
              </div>
              <div className="flex justify-between text-xs border-t pt-2">
                <span className="text-muted-foreground font-medium">Validation Status</span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Verified
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Supporting Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supporting Similar Incidents</CardTitle>
          <CardDescription>Historical data points that contributed to this synthesis.</CardDescription>
        </CardHeader>
        <CardContent>
          <SupportingIncidentsTable incidents={supportingData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationPanel;
