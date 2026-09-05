import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { renderPriorityBadge, renderRequisitionStatusBadge } from './documentBadges';
import { DOCUMENT_TYPE_LABELS, type DocumentRequisition } from '../../../types/document';

interface RequisitionTableProps {
  requisitions: DocumentRequisition[];
  onSelectRequisition: (req: DocumentRequisition) => void;
  onUploadForRequisition: (req: DocumentRequisition) => void;
  onUpdateStatus: (req: DocumentRequisition) => void;
  onExpireRequisition: (req: DocumentRequisition) => void;
  canUpload: boolean;
}

export const RequisitionTable: React.FC<RequisitionTableProps> = ({
  requisitions,
  onSelectRequisition,
  onUploadForRequisition,
  onUpdateStatus,
  onExpireRequisition,
  canUpload,
}) => {
  const isOverdue = (dueDateStr: string | null, status: string): boolean => {
    if (!dueDateStr) return false;
    if (status === 'ACCEPTED' || status === 'EXPIRED') return false;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="ui-table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client & Context</TableHead>
            <TableHead>Requested Document</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Fulfilled</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requisitions.map((req) => {
            const overdue = isOverdue(req.due_date, req.status);
            return (
              <TableRow
                key={req.id}
                onClick={() => onSelectRequisition(req)}
                style={{ cursor: 'pointer' }}
                className="document-row-interactive"
              >
                <TableCell>
                  <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                    {req.client_name || 'Unnamed Client'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                    {req.client_code && <span style={{ marginRight: '8px' }}>Code: {req.client_code}</span>}
                    {req.gstin && <span style={{ fontFamily: 'monospace' }}>GSTIN: {req.gstin}</span>}
                  </div>
                  {req.compliance_label && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', marginTop: '2px' }}>
                      Obligation: {req.compliance_label}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div style={{ fontWeight: 500, color: 'var(--color-slate-800)' }}>
                    {DOCUMENT_TYPE_LABELS[req.document_type] || req.document_type}
                  </div>
                  {req.description && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-slate-500)',
                        maxWidth: '260px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px',
                      }}
                      title={req.description}
                    >
                      {req.description}
                    </div>
                  )}
                </TableCell>

                <TableCell>{renderPriorityBadge(req.priority)}</TableCell>

                <TableCell>
                  <div style={{ fontSize: '0.875rem', color: overdue ? 'var(--color-danger-700)' : 'var(--color-slate-700)' }}>
                    {req.due_date ? new Date(req.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date'}
                  </div>
                  {overdue && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--color-danger-700)',
                        backgroundColor: '#fee2e2',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        marginTop: '2px',
                      }}
                    >
                      Overdue
                    </span>
                  )}
                </TableCell>

                <TableCell>{renderRequisitionStatusBadge(req.status)}</TableCell>

                <TableCell>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
                    {req.assigned_user_name || 'Unassigned'}
                  </span>
                </TableCell>

                <TableCell>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: (req.fulfilled_documents_count || 0) > 0 ? 'var(--color-success-700)' : 'var(--color-slate-400)',
                    }}
                  >
                    {req.fulfilled_documents_count || 0} file(s)
                  </span>
                </TableCell>

                <TableCell style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                    {canUpload && req.status !== 'ACCEPTED' && req.status !== 'EXPIRED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onUploadForRequisition(req)}
                        title="Upload file for this requisition"
                      >
                        Upload
                      </Button>
                    )}
                    {canUpload && req.status !== 'ACCEPTED' && req.status !== 'EXPIRED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onUpdateStatus(req)}
                      >
                        Status
                      </Button>
                    )}
                    {canUpload && req.status !== 'ACCEPTED' && req.status !== 'EXPIRED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onExpireRequisition(req)}
                        style={{ color: 'var(--color-danger-600)' }}
                      >
                        Expire
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
