import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ResolutionNotesFieldProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

const ResolutionNotesField: React.FC<ResolutionNotesFieldProps> = ({ value, onChange, error, disabled }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="resolution-notes" className="font-bold text-sm">
        Resolution Notes <span className="text-destructive">*</span>
      </Label>
      <Textarea
        id="resolution-notes"
        placeholder="Provide a detailed technical description of how the issue was resolved (minimum 20 characters)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
        rows={6}
      />
      {error ? (
        <p className="text-xs text-destructive font-medium">{error}</p>
      ) : (
        <p className="text-[10px] text-muted-foreground">
          This info will be used to train the system for future similar incidents. (Min: 20, Max: 5000 chars)
        </p>
      )}
    </div>
  );
};

export default ResolutionNotesField;