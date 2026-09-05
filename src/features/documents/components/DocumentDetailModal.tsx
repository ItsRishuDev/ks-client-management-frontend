import React from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { formatFileSize, renderDocumentTypeBadge, renderReviewStatusBadge } from './documentBadges';
import type { Document } from '../../../types/document';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onDownload: (doc: Document) => void;
  onReview: (doc: Document) => void;
  canReview: boolean;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document,
  onDownload,
  onReview,
  canReview,
}) => {
  if (!document) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Document Details">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: 'var(--color-slate-50)',
            borderRadius: '8px',
            border: '1px solid var(--color-slate-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-100)',
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              📄
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                {document.file_name}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                {formatFileSize(document.file_size)} • {document.mime_type}
              </div>
            </div>
          </div>
          <div>{renderReviewStatusBadge(document.review_status)}</div>
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Client</div>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', marginTop: '2px' }}>
              {document.client_name}
            </div>
            {document.client_code && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                Code: {document.client_code}
              </div>
            )}
          </div>

          <div>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Document Classification</div>
            <div style={{ marginTop: '2px' }}>{renderDocumentTypeBadge(document.document_type)}</div>
          </div>

          {document.gstin && (
            <div>
              <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>GST Registration</div>
              <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontFamily: 'monospace', marginTop: '2px' }}>
                {document.gstin}
              </div>
            </div>
          )}

          {document.compliance_label && (
            <div>
              <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Compliance Obligation</div>
              <div style={{ fontWeight: 600, color: 'var(--color-primary-700)', marginTop: '2px' }}>
                {document.compliance_label}
              </div>
            </div>
          )}

          <div>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Uploaded By</div>
            <div style={{ fontWeight: 500, color: 'var(--color-slate-800)', marginTop: '2px' }}>
              {document.uploaded_by_name || 'System / Practice User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
              {new Date(document.uploaded_at).toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Reviewed By</div>
            <div style={{ fontWeight: 500, color: 'var(--color-slate-800)', marginTop: '2px' }}>
              {document.reviewed_by_name || 'Pending Verification'}
            </div>
            {document.reviewed_at && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                {new Date(document.reviewed_at).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>

        {/* Review Notes */}
        {document.review_notes && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-slate-50)',
              borderRadius: '6px',
              border: '1px solid var(--color-slate-200)',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '4px' }}>
              Verification Notes
            </div>
            <div style={{ color: 'var(--color-slate-600)' }}>{document.review_notes}</div>
          </div>
        )}

        {/* Storage key audit reference */}
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-slate-400)', wordBreak: 'break-all' }}>
          Object Storage Key: <span style={{ fontFamily: 'monospace' }}>{document.storage_key}</span>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => onDownload(document)}>
              Download File
            </Button>
            {canReview && (
              <Button type="button" variant="primary" onClick={() => onReview(document)}>
                Review Document
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
