import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface ConfidenceScoreCardProps {
  score: number;
}

const ConfidenceScoreCard: React.FC<ConfidenceScoreCardProps> = ({ score }) => {
  const getConfidenceInfo = (val: number) => {
    if (val >= 90) return { label: 'Very High Confidence', color: 'text-green-600', bg: 'bg-green-600' };
    if (val >= 75) return { label: 'High Confidence', color: 'text-blue-600', bg: 'bg-blue-600' };
    if (val >= 50) return { label: 'Moderate Confidence', color: 'text-yellow-600', bg: 'bg-yellow-600' };
    return { label: 'Low Confidence', color: 'text-red-600', bg: 'bg-red-600' };
  };

  const info = getConfidenceInfo(score);

  return (
    <Card className="border-none shadow-none bg-muted/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              Recommendation Confidence
            </p>
            <h4 className={cn("text-sm font-bold", info.color)}>{info.label}</h4>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">{score.toFixed(0)}%</span>
          </div>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
           <div 
            className={cn("h-full w-full flex-1 transition-all", info.bg)} 
            style={{ transform: `translateX(-${100 - score}%)` }} 
           />
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Confidence is calculated based on the similarity scores of {score > 70 ? 'multiple strong matches' : 'available historical incidents'} 
          and the presence of consistent datafix patterns.
        </p>
      </CardContent>
    </Card>
  );
};

export default ConfidenceScoreCard;
