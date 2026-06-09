import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WorkflowExecution } from '../../types/workflow';
import AgentTabContent from './AgentTabContent';
import { ArrowRight } from 'lucide-react';

interface AgentTabsProps {
  workflow: WorkflowExecution | null;
}

interface Agent3Result {
  next_agent?: string;
}

const AgentTabs: React.FC<AgentTabsProps> = ({ workflow }) => {
  if (!workflow) return null;

  // Derive execution flow from agent_results
  const getExecutionFlow = () => {
    const flow = ['A1', 'A2', 'A3'];
    const agent3Result = workflow.agent_results?.agent_3 as Agent3Result | undefined;
    
    if (agent3Result) {
      if (agent3Result.next_agent === 'agent5') {
        flow.push('A5');
      } else if (agent3Result.next_agent === 'agent4') {
        flow.push('A4');
      }
    }
    return flow;
  };

  const flow = getExecutionFlow();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Agent Analysis Workbench</CardTitle>
            <CardDescription>Independently inspect the findings and processing logic of each agent.</CardDescription>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Path</span>
            {flow.map((step, idx) => (
              <React.Fragment key={step}>
                <span className="text-xs font-bold text-primary">{step}</span>
                {idx < flow.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="1">Agent 1</TabsTrigger>
            <TabsTrigger value="2">Agent 2</TabsTrigger>
            <TabsTrigger value="3">Agent 3</TabsTrigger>
            <TabsTrigger value="4">Agent 4</TabsTrigger>
            <TabsTrigger value="5">Agent 5</TabsTrigger>
          </TabsList>
          <TabsContent value="1">
            <AgentTabContent agentId="1" workflow={workflow} />
          </TabsContent>
          <TabsContent value="2">
            <AgentTabContent agentId="2" workflow={workflow} />
          </TabsContent>
          <TabsContent value="3">
            <AgentTabContent agentId="3" workflow={workflow} />
          </TabsContent>
          <TabsContent value="4">
            <AgentTabContent agentId="4" workflow={workflow} />
          </TabsContent>
          <TabsContent value="5">
            <AgentTabContent agentId="5" workflow={workflow} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgentTabs;
