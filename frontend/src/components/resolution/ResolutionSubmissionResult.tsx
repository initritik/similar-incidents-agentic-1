import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Database, BookOpen } from 'lucide-react';
import { Agent4Response } from '@/types/agent';

interface ResolutionSubmissionResultProps {
  result: Agent4Response | null;
  error: string | null;
}

const ResolutionSubmissionResult: React.FC<ResolutionSubmissionResultProps> = ({ result, error }) => {
  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4 duration-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Submission Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) return null;

  if (result.success) {
    return (
      <Alert className="border-green-500 bg-green-50/50 animate-in zoom-in-95 duration-500">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 font-bold">Resolution Submitted Successfully</AlertTitle>
        <AlertDescription className="text-green-700 space-y-3 mt-2">
          <p className="text-sm">{result.message}</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${result.knowledge_base_updated ? 'text-green-600' : 'text-slate-400'}`}>
              <BookOpen className="h-3.5 w-3.5" /> Knowledge Base Updated
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${result.qdrant_upsert_completed ? 'text-green-600' : 'text-slate-400'}`}>
              <Database className="h-3.5 w-3.5" /> Qdrant Vector Upserted
            </div>
          </div>
          <div className="text-[10px] font-mono bg-white/50 p-2 rounded border border-green-200">ID: {result.incident_number}</div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Submission Failed</AlertTitle>
      <AlertDescription>{result.message}</AlertDescription>
    </Alert>
  );
};

export default ResolutionSubmissionResult;