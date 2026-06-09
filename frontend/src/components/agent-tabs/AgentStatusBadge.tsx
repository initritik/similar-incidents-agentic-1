import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WorkflowStatus } from '../../types/workflow';

interface AgentStatusBadgeProps {
  status: WorkflowStatus;
}

const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case 'COMPLETED':
        return 'default'; // Using default for green/success in some configs, or style via className
      case 'FAILED':
        return 'destructive';
      case 'RUNNING':
        return 'secondary';
      case 'SKIPPED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getVariant()} className={status === 'COMPLETED' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
      {status}
    </Badge>
  );
};

export default AgentStatusBadge;