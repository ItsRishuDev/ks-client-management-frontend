import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { useReviewDocumentMutation } from '../hooks/useDocuments';
import { useToast } from '../../../components/ui/useToast';
import {
  DOCUMENT_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
  type Document,
  type DocumentReviewStatus,
} from '../../../types/document';

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const { success, error: toastError } = useToast();
  const reviewMutation = useReviewDocumentMutation(document?.id || '');

  const [reviewStatus, setReviewStatus] = useState<DocumentReviewStatus>('ACCEPTED');
  const [reviewNotes, setReviewNotes] = useState(document?.review_notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      await reviewMutation.mutateAsync({
        status: reviewStatus,
        notes: reviewNotes.trim(),
      });

      success(`Document marked as '${REVIEW_STATUS_LABELS[reviewStatus]}'.`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update review status.';
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Review Client Document">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: 'var(--color-danger-700)',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <div
          style={{
            backgroundColor: 'var(--color-slate-50)',
            border: '1px solid var(--color-slate-200)',
            borderRadius: '6px',
            padding: '0.75rem',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
            {document.file_name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
            Client: {document.client_name} • Type: {DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type}
          </div>
          {document.gstin && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)', marginTop: '2px' }}>
              GSTIN: {document.gstin}
            </div>
          )}
        </div>

        <Select
          label="Verification Decision *"
          value={reviewStatus}
          onChange={(e) => setReviewStatus(e.target.value as DocumentReviewStatus)}
          required
        >
          <option value="ACCEPTED">Accept - Verified & Reconciled</option>
          <option value="UNDER_REVIEW">Under Review - In Progress</option>
          <option value="REJECTED">Reject - Clarification or Re-upload Required</option>
          <option value="PENDING">Pending Review</option>
        </Select>

        <Textarea
          label="Review Notes / Feedback"
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          placeholder="e.g. Verified against purchase records. All tax amounts match."
          rows={3}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={reviewMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={reviewMutation.isPending}>
            Submit Review
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
