import React from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import {
  formatFileSize,
  renderDocumentTypeBadge,
  renderPriorityBadge,
  renderRequisitionStatusBadge,
  renderReviewStatusBadge,
} from './documentBadges';
import { useDocumentList } from '../hooks/useDocuments';
import {
  DOCUMENT_TYPE_LABELS,
  type Document,
  type DocumentRequisition,
  type RequisitionStatus,
} from '../../../types/document';

interface RequisitionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: DocumentRequisition | null;
  onUploadForRequisition: (req: DocumentRequisition) => void;
  onUpdateStatus: (req: DocumentRequisition) => void;
  onExpireRequisition: (req: DocumentRequisition) => void;
  onSelectDocument: (doc: Document) => void;
  onDownloadDocument: (doc: Document) => void;
  canUpload: boolean;
}

const LIFECYCLE_STAGES: RequisitionStatus[] = [
  'REQUESTED',
  'PENDING',
  'RECEIVED',
  'UNDER_REVIEW',
  'ACCEPTED',
];

export const RequisitionDetailModal: React.FC<RequisitionDetailModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onUploadForRequisition,
  onUpdateStatus,
  onExpireRequisition,
  onSelectDocument,
  onDownloadDocument,
  canUpload,
}) => {
  const { data: fulfilledDocsData } = useDocumentList(
    requisition?.id ? { document_requisition_id: requisition.id } : {}
  );
  const fulfilledDocs = fulfilledDocsData?.items || [];

  if (!requisition) return null;

  const currentStageIndex = LIFECYCLE_STAGES.indexOf(requisition.status as RequisitionStatus);
  const isSpecialStatus = requisition.status === 'REJECTED' || requisition.status === 'EXPIRED';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Document Requisition Details">
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                {DOCUMENT_TYPE_LABELS[requisition.document_type] || requisition.document_type}
              </h3>
              {renderPriorityBadge(requisition.priority)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-slate-600)', marginTop: '2px' }}>
              Client: <strong>{requisition.client_name}</strong>
              {requisition.client_code && <span> ({requisition.client_code})</span>}
            </div>
          </div>
          <div>{renderRequisitionStatusBadge(requisition.status)}</div>
        </div>

        {/* Lifecycle Stepper */}
        {!isSpecialStatus ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-slate-200)',
              borderRadius: '6px',
            }}
          >
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPast = currentStageIndex >= idx;
              const isCurrent = currentStageIndex === idx;
              return (
                <div
                  key={stage}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1,
                    textAlign: 'center',
                    opacity: isPast ? 1 : 0.4,
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent
                        ? 'var(--color-primary-600)'
                        : isPast
                        ? 'var(--color-success-600)'
                        : 'var(--color-slate-300)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {isPast && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--color-primary-800)' : 'var(--color-slate-700)',
                    }}
                  >
                    {stage.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: 'var(--color-danger-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>This requisition is currently marked as <strong>{requisition.status}</strong>.</span>
          </div>
        )}

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Document Type</div>
            <div style={{ marginTop: '2px' }}>{renderDocumentTypeBadge(requisition.document_type)}</div>
          </div>

          <div>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Due Date</div>
            <div style={{ fontWeight: 500, color: 'var(--color-slate-800)', marginTop: '2px' }}>
              {requisition.due_date ? new Date(requisition.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date'}
            </div>
          </div>

          {requisition.gstin && (
            <div>
              <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>GSTIN Context</div>
              <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontFamily: 'monospace', marginTop: '2px' }}>
                {requisition.gstin}
              </div>
            </div>
          )}

          {requisition.compliance_label && (
            <div>
              <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Linked Compliance</div>
              <div style={{ fontWeight: 600, color: 'var(--color-primary-700)', marginTop: '2px' }}>
                {requisition.compliance_label}
              </div>
            </div>
          )}

          <div>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Assigned Team Member</div>
            <div style={{ fontWeight: 500, color: 'var(--color-slate-800)', marginTop: '2px' }}>
              {requisition.assigned_user_name || 'Unassigned'}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>Date Received</div>
            <div style={{ fontWeight: 500, color: 'var(--color-slate-800)', marginTop: '2px' }}>
              {requisition.received_date ? new Date(requisition.received_date).toLocaleDateString('en-IN') : 'Pending receipt'}
            </div>
          </div>
        </div>

        {/* Description & Notes */}
        {requisition.description && (
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
              Instructions / Description
            </div>
            <div style={{ color: 'var(--color-slate-600)' }}>{requisition.description}</div>
          </div>
        )}

        {requisition.notes && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fffbeb',
              borderRadius: '6px',
              border: '1px solid #fef3c7',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
              Internal Practice Notes
            </div>
            <div style={{ color: '#78350f' }}>{requisition.notes}</div>
          </div>
        )}

        {/* Fulfilled Documents Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
              Fulfilled Documents ({fulfilledDocs.length})
            </h4>
            {canUpload && requisition.status !== 'ACCEPTED' && requisition.status !== 'EXPIRED' && (
              <Button size="sm" variant="secondary" onClick={() => onUploadForRequisition(requisition)}>
                + Upload File
              </Button>
            )}
          </div>

          {fulfilledDocs.length === 0 ? (
            <div
              style={{
                padding: '1rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-slate-50)',
                borderRadius: '6px',
                border: '1px dashed var(--color-slate-300)',
                color: 'var(--color-slate-500)',
                fontSize: '0.8125rem',
              }}
            >
              No files uploaded yet for this request.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {fulfilledDocs.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-slate-200)',
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => onSelectDocument(doc)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-slate-900)' }}>
                      {doc.file_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                      {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {renderReviewStatusBadge(doc.review_status)}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownloadDocument(doc)}
                      title="Download file"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canUpload && requisition.status !== 'ACCEPTED' && requisition.status !== 'EXPIRED' && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onExpireRequisition(requisition)}
                style={{ color: 'var(--color-danger-600)' }}
              >
                Expire
              </Button>
            )}
            {canUpload && (
              <Button type="button" variant="primary" onClick={() => onUpdateStatus(requisition)}>
                Update Status
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
