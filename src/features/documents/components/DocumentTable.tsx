import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { formatFileSize, renderDocumentTypeBadge, renderReviewStatusBadge } from './documentBadges';
import type { Document } from '../../../types/document';

interface DocumentTableProps {
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
  onDownloadDocument: (doc: Document) => void;
  onReviewDocument: (doc: Document) => void;
  canReview: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onSelectDocument,
  onDownloadDocument,
  onReviewDocument,
  canReview,
}) => {
  return (
    <div className="ui-table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document & File</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Client / Context</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Review Status</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              style={{ cursor: 'pointer' }}
              className="document-row-interactive"
            >
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    📄
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                      {doc.file_name}
                    </div>
                    {doc.requisition_description && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-slate-500)',
                          marginTop: '2px',
                          maxWidth: '280px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Req: {doc.requisition_description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>{renderDocumentTypeBadge(doc.document_type)}</TableCell>

              <TableCell>
                <div style={{ fontWeight: 500, color: 'var(--color-slate-800)' }}>
                  {doc.client_name || 'Unnamed Client'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                  {doc.client_code && <span style={{ marginRight: '8px' }}>Code: {doc.client_code}</span>}
                  {doc.gstin && <span style={{ fontFamily: 'monospace' }}>GSTIN: {doc.gstin}</span>}
                </div>
                {doc.compliance_label && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', marginTop: '2px' }}>
                    {doc.compliance_label}
                  </div>
                )}
              </TableCell>

              <TableCell>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-600)', fontFamily: 'monospace' }}>
                  {formatFileSize(doc.file_size)}
                </span>
              </TableCell>

              <TableCell>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-slate-700)' }}>
                  {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                  by {doc.uploaded_by_name || 'System'}
                </div>
              </TableCell>

              <TableCell>
                <div>{renderReviewStatusBadge(doc.review_status)}</div>
                {doc.reviewed_by_name && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                    by {doc.reviewed_by_name}
                  </div>
                )}
              </TableCell>

              <TableCell style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onDownloadDocument(doc)}
                    title="Download document"
                  >
                    Download
                  </Button>
                  {canReview && (
                    <Button
                      size="sm"
                      variant={doc.review_status === 'PENDING' ? 'primary' : 'ghost'}
                      onClick={() => onReviewDocument(doc)}
                      title="Review document"
                    >
                      Review
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
