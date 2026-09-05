import React, { useState } from 'react';
import type {
  GSTCompliance,
  ComplianceStatus,
  PriorityLevel,
  UpdateCompliancePayload,
} from '../../../types/compliance';
import { ALLOWED_STATUS_TRANSITIONS } from '../../../types/compliance';
import type { FirmUserOption } from '../../../types/client';
import {
  Dialog,
  Button,
  Select,
  Textarea,
  Input,
} from '../../../components/ui';

export interface ComplianceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  compliance: GSTCompliance | null;
  users: FirmUserOption[];
  onUpdate: (complianceId: string, payload: UpdateCompliancePayload) => Promise<void>;
  isSubmitting: boolean;
}

export const ComplianceStatusModal: React.FC<ComplianceStatusModalProps> = ({
  isOpen,
  onClose,
  compliance,
  users,
  onUpdate,
  isSubmitting,
}) => {
  if (!compliance) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Compliance — ${compliance.return_type.replace('_', '-')} (${compliance.tax_period})`}
    >
      <InnerStatusForm
        compliance={compliance}
        users={users}
        onClose={onClose}
        onUpdate={onUpdate}
        isSubmitting={isSubmitting}
      />
    </Dialog>
  );
};

interface InnerProps {
  compliance: GSTCompliance;
  users: FirmUserOption[];
  onClose: () => void;
  onUpdate: (complianceId: string, payload: UpdateCompliancePayload) => Promise<void>;
  isSubmitting: boolean;
}

const InnerStatusForm: React.FC<InnerProps> = ({
  compliance,
  users,
  onClose,
  onUpdate,
  isSubmitting,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ComplianceStatus>(compliance.status);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>(compliance.priority);
  const [assignedUser, setAssignedUser] = useState<string>(compliance.assigned_user || '');
  const [dueDate, setDueDate] = useState<string>(compliance.statutory_due_date || '');
  const [notes, setNotes] = useState<string>(compliance.notes || '');
  const [formError, setFormError] = useState<string>('');

  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[compliance.status] || [];
  const statusOptions = [
    { value: compliance.status, label: `${compliance.status.replace(/_/g, ' ')} (Current)` },
    ...allowedTransitions.map((st) => ({
      value: st,
      label: `→ ${st.replace(/_/g, ' ')}`,
    })),
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((u) => ({
      value: u.id,
      label: `${u.name} (${u.role.replace('_', ' ')})`,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const payload: UpdateCompliancePayload = {
      status: selectedStatus,
      priority: selectedPriority,
      assigned_user: assignedUser || null,
      statutory_due_date: dueDate || undefined,
      notes: notes.trim(),
    };

    try {
      await onUpdate(compliance.id, payload);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to update compliance obligation.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {formError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-danger-bg, #fef2f2)',
            border: '1px solid var(--color-danger-border, #fecaca)',
            borderRadius: 'var(--radius-md, 6px)',
            color: 'var(--color-danger-text, #991b1b)',
            fontSize: '0.875rem',
          }}
        >
          {formError}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
        <div><strong>Client:</strong> {compliance.client_name || compliance.client_legal_name}</div>
        <div><strong>GSTIN:</strong> {compliance.gstin}</div>
        <div><strong>Current Status:</strong> {compliance.status.replace(/_/g, ' ')}</div>
      </div>

      <Select
        label="Workflow Status"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value as ComplianceStatus)}
        options={statusOptions}
        helperText={
          allowedTransitions.length === 0
            ? 'No further status transitions available from current state.'
            : 'Select the next valid compliance lifecycle state.'
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select
          label="Priority"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel)}
          options={priorityOptions}
        />
        <Input
          label="Statutory Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <Select
        label="Assigned Staff"
        value={assignedUser}
        onChange={(e) => setAssignedUser(e.target.value)}
        options={userOptions}
      />

      <Textarea
        label="Compliance Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add progress notes or follow-up details..."
        rows={3}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};
