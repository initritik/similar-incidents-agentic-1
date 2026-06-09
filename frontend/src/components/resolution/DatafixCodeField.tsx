import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DatafixCodeFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const DatafixCodeField: React.FC<DatafixCodeFieldProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="datafix-code" className="font-bold text-sm">
        Optional Datafix Code
      </Label>
      <Textarea
        id="datafix-code"
        placeholder="Enter SQL scripts, JSON patches, or CLI commands used for remediation..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="font-mono text-xs bg-slate-50"
        rows={8}
      />
      <p className="text-[10px] text-muted-foreground">
        Include technical remediation scripts if applicable. (Max: 10000 chars)
      </p>
    </div>
  );
};

export default DatafixCodeField;