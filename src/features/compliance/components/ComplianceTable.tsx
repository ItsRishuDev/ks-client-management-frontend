import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import type { GSTCompliance, ComplianceStatus } from '../../../types/compliance';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Skeleton,
  EmptyState,
} from '../../../components/ui';
import {
  renderComplianceStatusBadge,
  renderPriorityBadge,
} from './complianceBadges';

export interface ComplianceTableProps {
  compliances: GSTCompliance[];
  isLoading: boolean;
  onSelectCompliance: (compliance: GSTCompliance) => void;
  onStatusChangeClick?: (compliance: GSTCompliance) => void;
}

export const ComplianceTable: React.FC<ComplianceTableProps> = ({
  compliances,
  isLoading,
  onSelectCompliance,
  onStatusChangeClick,
}) => {
  const isOverdue = (dueDate: string, status: ComplianceStatus) => {
    if (status === 'FILED' || status === 'VERIFIED' || status === 'LATE') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today || status === 'OVERDUE';
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Obligation</TableHead>
            <TableHead>Client & Trade Name</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>Tax Period</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton variant="text" width="60%" /></TableCell>
              <TableCell><Skeleton variant="text" width="80%" /></TableCell>
              <TableCell><Skeleton variant="text" width="70%" /></TableCell>
              <TableCell><Skeleton variant="text" width="50%" /></TableCell>
              <TableCell><Skeleton variant="text" width="60%" /></TableCell>
              <TableCell><Skeleton variant="text" width="40%" /></TableCell>
              <TableCell><Skeleton variant="text" width="60%" /></TableCell>
              <TableCell><Skeleton variant="text" width="50%" /></TableCell>
              <TableCell><Skeleton variant="text" width="40%" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (compliances.length === 0) {
    return (
      <EmptyState
        title="No compliance obligations found"
        description="No GST compliance records matched your filter criteria or search query."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Obligation</TableHead>
          <TableHead>Client & Trade Name</TableHead>
          <TableHead>GSTIN</TableHead>
          <TableHead>Tax Period</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {compliances.map((comp) => {
          const overdue = isOverdue(comp.statutory_due_date, comp.status);
          return (
            <TableRow
              key={comp.id}
              onClick={() => onSelectCompliance(comp)}
              style={{ cursor: 'pointer' }}
            >
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant="primary" size="sm">
                    {comp.return_type.replace('_', '-')}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: 'var(--color-slate-900)', fontSize: '0.875rem' }}>
                    {comp.client_name || comp.client_legal_name}
                  </strong>
                  {comp.trade_name && comp.trade_name !== comp.client_name && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                      {comp.trade_name}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-800)',
                  }}
                >
                  {comp.gstin}
                </span>
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-slate-800)' }}>
                    {comp.tax_period}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    FY {comp.financial_year}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    color: overdue ? 'var(--color-danger-text)' : 'var(--color-slate-700)',
                    fontWeight: overdue ? 600 : 400,
                    fontSize: '0.8125rem',
                  }}
                >
                  {overdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
                  <span>{comp.statutory_due_date}</span>
                </div>
              </TableCell>
              <TableCell>{renderPriorityBadge(comp.priority)}</TableCell>
              <TableCell>
                <span style={{ fontSize: '0.8125rem', color: comp.assigned_user_name ? 'var(--color-slate-800)' : 'var(--color-slate-400)' }}>
                  {comp.assigned_user_name || 'Unassigned'}
                </span>
              </TableCell>
              <TableCell>{renderComplianceStatusBadge(comp.status)}</TableCell>
              <TableCell style={{ textAlign: 'right' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectCompliance(comp)}
                  >
                    Details
                  </Button>
                  {onStatusChangeClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChangeClick(comp)}
                    >
                      Update
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
