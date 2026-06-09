import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, Code2 } from 'lucide-react';

interface DatafixTemplateCardProps {
  template: string;
}

const DatafixTemplateCard: React.FC<DatafixTemplateCardProps> = ({ template }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatWithPlaceholders = (text: string) => {
    // Regex to find the standard placeholders defined in Agent 5
    const placeholderRegex = /(<PASTE_[A-Z_]+_ID>)/g;
    
    return text.split(placeholderRegex).map((part, i) => {
      if (part.match(placeholderRegex)) {
        return (
          <span key={i} className="inline-block bg-yellow-100 text-yellow-900 px-1.5 py-0.5 rounded font-bold border border-yellow-300 shadow-sm mx-0.5">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold">Recommended Datafix Template</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 px-2 text-xs">
          {copied ? <Check className="mr-1 h-3 w-3 text-green-600" /> : <Copy className="mr-1 h-3 w-3" />}
          {copied ? 'Copied' : 'Copy Template'}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-slate-950 p-6 font-mono text-xs leading-relaxed text-slate-50 overflow-x-auto">
          <pre className="whitespace-pre-wrap">
            {template ? formatWithPlaceholders(template) : (
              <span className="text-slate-500 italic">No datafix template recommended for this scenario.</span>
            )}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatafixTemplateCard;