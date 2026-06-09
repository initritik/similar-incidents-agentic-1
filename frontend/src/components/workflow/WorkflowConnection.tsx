import React from 'react';
import { ArrowDown } from 'lucide-react';

interface WorkflowConnectionProps {
  type?: 'vertical' | 'branch-left' | 'branch-right';
  active?: boolean;
}

const WorkflowConnection: React.FC<WorkflowConnectionProps> = ({ type = 'vertical', active = false }) => {
  const colorClass = active ? 'text-blue-500' : 'text-slate-200';
  
  if (type === 'vertical') {
    return (
      <div className="flex flex-col items-center py-2">
        <div className={`w-0.5 h-6 ${active ? 'bg-blue-500' : 'bg-slate-200'} transition-colors duration-500`} />
        <ArrowDown className={`h-4 w-4 -mt-1 ${colorClass} transition-colors duration-500`} />
      </div>
    );
  }

  return null; // Branch connections handled in Layout
};

export default WorkflowConnection;