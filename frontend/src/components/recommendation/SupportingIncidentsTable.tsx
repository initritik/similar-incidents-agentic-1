import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SupportingIncident {
  incident_number: string;
  similarity_score: number;
  state?: string;
  assignment_group?: string;
  assigned_to?: string;
}

interface SupportingIncidentsTableProps {
  incidents: SupportingIncident[];
}

const SupportingIncidentsTable: React.FC<SupportingIncidentsTableProps> = ({ incidents }) => {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[120px] text-[10px] font-bold uppercase">Incident ID</TableHead>
            <TableHead className="text-[10px] font-bold uppercase">Similarity</TableHead>
            <TableHead className="text-[10px] font-bold uppercase">State</TableHead>
            <TableHead className="text-[10px] font-bold uppercase">Assignment Group</TableHead>
            <TableHead className="text-[10px] font-bold uppercase">Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((inc) => (
            <TableRow key={inc.incident_number}>
              <TableCell className="font-mono text-xs font-bold">{inc.incident_number}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 min-w-[100px]">
                  <Progress value={inc.similarity_score * 100} className="h-1.5 w-12" />
                  <span className="text-[10px] font-medium">{(inc.similarity_score * 100).toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[9px] h-4 uppercase">{inc.state || 'RESOLVED'}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{inc.assignment_group || 'N/A'}</TableCell>
              <TableCell className="text-xs">{inc.assigned_to || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {incidents.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground italic">No supporting incidents found.</div>
      )}
    </div>
  );
};

export default SupportingIncidentsTable;