import React from 'react';

const states = [
  { label: 'Pending', color: 'bg-slate-200' },
  { label: 'Running', color: 'bg-blue-500 animate-pulse' },
  { label: 'Completed', color: 'bg-green-500' },
  { label: 'Failed', color: 'bg-red-500' },
  { label: 'Skipped', color: 'bg-slate-400 opacity-50' },
];

const WorkflowLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-4 border rounded-lg bg-slate-50/50">
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Status Legend:</span>
      <div className="flex flex-wrap gap-4">
        {states.map((state) => (
          <div key={state.label} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${state.color}`} />
            <span className="text-xs font-medium text-slate-600">{state.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowLegend;