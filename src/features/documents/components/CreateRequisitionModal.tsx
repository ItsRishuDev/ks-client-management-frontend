import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { useClientsList, useClientGstRegistrations } from '../../clients/hooks/useClients';
import { useCreateRequisitionMutation } from '../hooks/useDocuments';
import { useToast } from '../../../components/ui/useToast';
import {
  DOCUMENT_TYPE_LABELS,
  PRIORITY_LABELS,
  type CreateRequisitionPayload,
  type DocumentType,
  type PriorityLevel,
} from '../../../types/document';

interface CreateRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
  preselectedComplianceId?: string;
}

export const CreateRequisitionModal: React.FC<CreateRequisitionModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
  preselectedComplianceId,
}) => {
  const { success, error: toastError } = useToast();
  const createMutation = useCreateRequisitionMutation();

  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [gstRegistrationId, setGstRegistrationId] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('SALES_REGISTER');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch clients for dropdown
  const { data: clientsData, isLoading: isLoadingClients } = useClientsList({ page_size: 100 });
  const clients = clientsData?.items || [];

  // Fetch GST registrations for selected client
  const { data: gstRegistrations = [] } = useClientGstRegistrations(clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMsg('Please select a client.');
      return;
    }

    try {
      setErrorMsg('');
      const payload: CreateRequisitionPayload = {
        client_id: clientId,
        gst_registration_id: gstRegistrationId || undefined,
        compliance_id: preselectedComplianceId || undefined,
        document_type: documentType,
        priority,
        due_date: dueDate || null,
        description: description.trim(),
        notes: notes.trim(),
      };

      await createMutation.mutateAsync(payload);
      success('Document requisition created successfully.');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create requisition.';
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Request Document from Client">
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

        <Select
          label="Client *"
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setGstRegistrationId('');
          }}
          disabled={isLoadingClients || !!preselectedClientId}
          required
        >
          <option value="">Select a Client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name || c.legal_name} ({c.client_code})
            </option>
          ))}
        </Select>

        {clientId && gstRegistrations.length > 0 && (
          <Select
            label="GSTIN Context (Optional)"
            value={gstRegistrationId}
            onChange={(e) => setGstRegistrationId(e.target.value)}
          >
            <option value="">No specific GSTIN (All / General)</option>
            {gstRegistrations.map((g) => (
              <option key={g.id} value={g.id}>
                {g.gstin} - {g.trade_name || g.legal_name} ({g.state_name})
              </option>
            ))}
          </Select>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Document Type *"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            required
          >
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
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
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Textarea
          label="Request Description / Instructions"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Please provide sales ledger and monthly invoices spreadsheet for August 2026."
          rows={3}
        />

        <Textarea
          label="Internal Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes visible to practice team."
          rows={2}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={createMutation.isPending}>
            Create Requisition
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
