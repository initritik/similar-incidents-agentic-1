import React from 'react';
import { WorkflowExecution, AgentStatus } from '../../types/workflow';
import WorkflowNode from './WorkflowNode';
import WorkflowConnection from './WorkflowConnection';
import WorkflowLegend from './WorkflowLegend';
import { GitBranch } from 'lucide-react';

interface WorkflowDiagramProps {
  workflow: WorkflowExecution | null;
}

const AGENT_METADATA = [
  { id: 'Agent 1', title: 'Data Integrity Checker' },
  { id: 'Agent 2', title: 'Similarity Search' },
  { id: 'Agent 3', title: 'Similar Incident Retrieval' },
  { id: 'Agent 4', title: 'Resolution Capture' },
  { id: 'Agent 5', title: 'Resolution Recommendation' },
];

const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ workflow }) => {
  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-slate-50/50 text-slate-400">
        <GitBranch className="h-10 w-10 mb-4 opacity-20" />
        <p className="text-lg font-medium">Submit an incident to start workflow execution.</p>
        <p className="text-sm">The live execution path will appear here.</p>
      </div>
    );
  }

  const getAgentStatus = (name: string): AgentStatus => {
    const status = workflow.agent_statuses.find(s => s.agent_name === name);
    return status || {
      agent_name: name,
      status: 'PENDING',
      current_task: 'Waiting to start...',
      message: '',
      started_at: '',
    };
  };

  const isConnectionActive = (prevAgentName: string, currentAgentName: string) => {
    const current = getAgentStatus(currentAgentName);
    return current.status === 'RUNNING' || current.status === 'COMPLETED';
  };

  const renderNode = (id: string) => {
    const metadata = AGENT_METADATA.find(m => m.id === id)!;
    const status = getAgentStatus(id);
    return (
      <WorkflowNode
        name={metadata.id}
        title={metadata.title}
        status={status.status}
        task={status.current_task}
        message={status.message}
      />
    );
  };

  return (
    <div className="space-y-8 w-full">
      <WorkflowLegend />
      
      <div className="flex flex-col items-center py-4 overflow-x-auto">
        {/* Linear Path: Agent 1 -> 2 -> 3 */}
        <div className="flex flex-col items-center">
          {renderNode('Agent 1')}
          <WorkflowConnection active={isConnectionActive('Agent 1', 'Agent 2')} />
          {renderNode('Agent 2')}
          <WorkflowConnection active={isConnectionActive('Agent 2', 'Agent 3')} />
          {renderNode('Agent 3')}
        </div>

        {/* Branch: Agent 4 and 5 */}
        <div className="relative mt-8 w-full max-w-2xl">
          {/* Branching Lines (SVG) */}
          <svg className="absolute top-[-32px] left-0 w-full h-8 overflow-visible pointer-events-none">
            <path 
              d="M 50% 0 L 50% 16 L 25% 16 L 25% 32" 
              fill="none" 
              stroke={isConnectionActive('Agent 3', 'Agent 4') ? '#3b82f6' : '#e2e8f0'} 
              strokeWidth="2" 
              className="transition-colors duration-500"
            />
            <path 
              d="M 50% 0 L 50% 16 L 75% 16 L 75% 32" 
              fill="none" 
              stroke={isConnectionActive('Agent 3', 'Agent 5') ? '#3b82f6' : '#e2e8f0'} 
              strokeWidth="2"
              className="transition-colors duration-500"
            />
            <circle cx="50%" cy="0" r="3" fill="#cbd5e1" />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Path: No Matches</span>
              {renderNode('Agent 4')}
            </div>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Path: Similar Found</span>
              {renderNode('Agent 5')}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          Workflow ID: <span className="font-mono">{workflow.workflow_id}</span> - Started at {new Date(workflow.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default WorkflowDiagram;
