import React from 'react';
import { CheckCircle2, Circle, AlertCircle, PlayCircle, FastForward } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkflowStatus } from '../../types/workflow';

interface WorkflowNodeProps {
  name: string;
  title: string;
  status: WorkflowStatus;
  task?: string;
  message?: string;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ name, title, status, task, message }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'COMPLETED':
        return 'border-green-500 bg-green-50 text-green-700 shadow-sm';
      case 'RUNNING':
        return 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-200 animate-in fade-in zoom-in duration-300';
      case 'FAILED':
        return 'border-red-500 bg-red-50 text-red-700';
      case 'SKIPPED':
        return 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
      default: // PENDING
        return 'border-slate-200 bg-white text-slate-500';
    }
  };

  const getIcon = () => {
    const className = "h-5 w-5 shrink-0";
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className={`${className} text-green-500`} />;
      case 'RUNNING':
        return <PlayCircle className={`${className} text-blue-500 animate-pulse`} />;
      case 'FAILED':
        return <AlertCircle className={`${className} text-red-500`} />;
      case 'SKIPPED':
        return <FastForward className={`${className} text-slate-400`} />;
      default:
        return <Circle className={`${className} text-slate-300`} />;
    }
  };

  return (
    <Card className={`transition-all duration-300 border-2 ${getStatusStyles()} min-w-[240px] max-w-[320px]`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              {name}
            </p>
            <h4 className="text-sm font-bold leading-tight">
              {title}
            </h4>
          </div>
          {getIcon()}
        </div>
        
        {(task || message) && (
          <div className="pt-2 border-t border-current/10">
            {task && (
              <p className="text-xs font-medium truncate italic">
                {task}
              </p>
            )}
            {message && (
              <p className="text-[10px] leading-relaxed opacity-80 mt-1 line-clamp-2">
                {message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowNode;