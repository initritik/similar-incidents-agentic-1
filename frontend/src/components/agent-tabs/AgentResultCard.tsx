import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AgentResultCardProps {
  incidentNumber: string;
  title: string;
  score: number;
  state?: string;
  description?: string;
}

const AgentResultCard: React.FC<AgentResultCardProps> = ({ incidentNumber, title, score, state, description }) => {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-tighter">{incidentNumber}</span>
            <h5 className="text-sm font-semibold leading-tight line-clamp-1">{title}</h5>
          </div>
          <Badge variant="secondary" className="ml-2 font-mono">
            {(score * 100).toFixed(1)}% Match
          </Badge>
        </div>
        <div className="flex gap-2 items-center mb-2">
           {state && <Badge variant="outline" className="text-[10px] h-4 uppercase">{state}</Badge>}
        </div>
        {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default AgentResultCard;