import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { useUpdateRequisitionMutation } from '../hooks/useDocuments';
import { useToast } from '../../../components/ui/useToast';
import {
  ALLOWED_REQUISITION_TRANSITIONS,
  PRIORITY_LABELS,
  REQUISITION_STATUS_LABELS,
  type DocumentRequisition,
  type PriorityLevel,
  type RequisitionStatus,
} from '../../../types/document';

interface RequisitionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: DocumentRequisition | null;
}

export const RequisitionStatusModal: React.FC<RequisitionStatusModalProps> = ({
  isOpen,
  onClose,
  requisition,
}) => {
  const { success, error: toastError } = useToast();
  const updateMutation = useUpdateRequisitionMutation(requisition?.id || '');

  const [status, setStatus] = useState<RequisitionStatus>(requisition?.status || 'REQUESTED');
  const [priority, setPriority] = useState<PriorityLevel>(requisition?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(requisition?.due_date || '');
  const [notes, setNotes] = useState(requisition?.notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!requisition) return null;

  const validNextStatuses = ALLOWED_REQUISITION_TRANSITIONS[requisition.status] || [];
  const statusOptions: RequisitionStatus[] = [
    requisition.status,
    ...validNextStatuses,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      await updateMutation.mutateAsync({
        status: status !== requisition.status ? status : undefined,
        priority,
        due_date: dueDate || null,
        notes: notes.trim(),
      });

      success('Requisition updated successfully.');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update requisition.';
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Update Requisition Status">
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
            {requisition.client_name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
            Current Status: <strong>{REQUISITION_STATUS_LABELS[requisition.status]}</strong> • Priority: {PRIORITY_LABELS[requisition.priority]}
          </div>
        </div>

        <Select
          label="Requisition Status *"
          value={status}
          onChange={(e) => setStatus(e.target.value as RequisitionStatus)}
          required
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {REQUISITION_STATUS_LABELS[opt]} {opt === requisition.status ? '(Current)' : ''}
            </option>
          ))}
        </Select>

        <Select
          label="Priority *"
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          required
        >
          {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Select>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Textarea
          label="Internal Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add progress notes or follow-up details..."
          rows={3}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
