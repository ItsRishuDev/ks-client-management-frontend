import React, { useState, useMemo } from 'react';
import type {
  CreateCompliancePayload,
  GSTReturnType,
  PriorityLevel,
  ComplianceStatus,
} from '../../../types/compliance';
import type { FirmUserOption } from '../../../types/client';
import { useClientsList, useClient360 } from '../../clients/hooks/useClients';
import {
  Dialog,
  Button,
  Input,
  Select,
  Textarea,
  Skeleton,
} from '../../../components/ui';

export interface ComplianceModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCompliancePayload) => Promise<void>;
  users: FirmUserOption[];
  isSubmitting: boolean;
}

export const ComplianceModalForm: React.FC<ComplianceModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create GST Compliance Obligation"
    >
      <InnerComplianceForm
        users={users}
        onClose={onClose}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </Dialog>
  );
};

interface InnerFormProps {
  users: FirmUserOption[];
  onClose: () => void;
  onSubmit: (payload: CreateCompliancePayload) => Promise<void>;
  isSubmitting: boolean;
}

const InnerComplianceForm: React.FC<InnerFormProps> = ({
  users,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { data: clientsData, isLoading: isLoadingClients } = useClientsList({ page_size: 100, status: 'ACTIVE' });
  const clients = useMemo(() => clientsData?.items || [], [clientsData]);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedGstRegistrationId, setSelectedGstRegistrationId] = useState<string>('');
  const [returnType, setReturnType] = useState<GSTReturnType>('GSTR_3B');
  const [financialYear, setFinancialYear] = useState<string>('2026-27');
  const [taxPeriod, setTaxPeriod] = useState<string>('August 2026');
  const [statutoryDueDate, setStatutoryDueDate] = useState<string>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 20).toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [status, setStatus] = useState<ComplianceStatus>('UPCOMING');
  const [assignedUser, setAssignedUser] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Fetch GST registrations for selected client via 360 view
  const { data: client360, isLoading: isLoading360 } = useClient360(selectedClientId);
  const gstRegistrations = useMemo(() => client360?.gst_registrations || [], [client360]);

  const effectiveGstRegistrationId = selectedGstRegistrationId || gstRegistrations[0]?.id || '';

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedGstRegistrationId('');
  };

  const clientOptions = [
    { value: '', label: '-- Select Client --' },
    ...clients.map((c) => ({
      value: c.id,
      label: `${c.legal_name}${c.display_name ? ` (${c.display_name})` : ''} - ${c.client_code}`,
    })),
  ];

  const gstOptions = [
    { value: '', label: gstRegistrations.length === 0 ? '-- No GSTINs for this client --' : '-- Select GSTIN --' },
    ...gstRegistrations.map((g) => ({
      value: g.id,
      label: `${g.gstin} (${g.state_name || g.state_code}) - ${g.trade_name || g.legal_name}`,
    })),
  ];

  const returnTypeOptions = [
    { value: 'GSTR_3B', label: 'GSTR-3B (Monthly Summary Return)' },
    { value: 'GSTR_1', label: 'GSTR-1 (Outward Supplies)' },
    { value: 'CMP_08', label: 'CMP-08 (Composition Statement)' },
    { value: 'GSTR_4', label: 'GSTR-4 (Composition Annual)' },
    { value: 'GSTR_9', label: 'GSTR-9 (Annual Return)' },
    { value: 'GSTR_9C', label: 'GSTR-9C (Reconciliation Statement)' },
    { value: 'IFF', label: 'IFF (Invoice Furnishing Facility)' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const statusOptions = [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'DOCUMENTS_PENDING', label: 'Documents Pending' },
    { value: 'DATA_RECEIVED', label: 'Data Received' },
    { value: 'IN_PREPARATION', label: 'In Preparation' },
    { value: 'NOT_DUE', label: 'Not Due' },
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

    if (!selectedClientId) {
      setFormError('Please select a client.');
      return;
    }
    if (!effectiveGstRegistrationId) {
      setFormError('Please select a GSTIN registration for this client.');
      return;
    }
    if (!financialYear.trim()) {
      setFormError('Financial year is required (e.g. 2026-27).');
      return;
    }
    if (!taxPeriod.trim()) {
      setFormError('Tax period is required (e.g. August 2026).');
      return;
    }
    if (!statutoryDueDate) {
      setFormError('Statutory due date is required.');
      return;
    }

    const payload: CreateCompliancePayload = {
      gst_registration_id: effectiveGstRegistrationId,
      return_type: returnType,
      financial_year: financialYear.trim(),
      tax_period: taxPeriod.trim(),
      statutory_due_date: statutoryDueDate,
      status,
      priority,
      assigned_user: assignedUser || null,
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create compliance obligation.');
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

      {isLoadingClients ? (
        <Skeleton variant="rectangular" height={38} />
      ) : (
        <Select
          label="Client"
          value={selectedClientId}
          onChange={(e) => handleClientChange(e.target.value)}
          options={clientOptions}
          required
        />
      )}

      {selectedClientId && (
        isLoading360 ? (
          <Skeleton variant="rectangular" height={38} />
        ) : (
          <Select
            label="GST Registration (GSTIN)"
            value={effectiveGstRegistrationId}
            onChange={(e) => setSelectedGstRegistrationId(e.target.value)}
            options={gstOptions}
            disabled={gstRegistrations.length === 0}
            helperText={
              gstRegistrations.length === 0
                ? 'This client has no active GSTINs registered. Please add a GSTIN in the Client 360 page first.'
                : undefined
            }
            required
          />
        )
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select
          label="Return Type"
          value={returnType}
          onChange={(e) => setReturnType(e.target.value as GSTReturnType)}
          options={returnTypeOptions}
          required
        />
        <Input
          label="Financial Year"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          placeholder="e.g. 2026-27"
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input
          label="Tax Period"
          value={taxPeriod}
          onChange={(e) => setTaxPeriod(e.target.value)}
          placeholder="e.g. August 2026"
          required
        />
        <Input
          label="Statutory Due Date"
          type="date"
          value={statutoryDueDate}
          onChange={(e) => setStatutoryDueDate(e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select
          label="Initial Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ComplianceStatus)}
          options={statusOptions}
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          options={priorityOptions}
        />
      </div>

      <Select
        label="Assigned Staff"
        value={assignedUser}
        onChange={(e) => setAssignedUser(e.target.value)}
        options={userOptions}
      />

      <Textarea
        label="Notes / Instructions"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Specific instructions or client-provided context..."
        rows={3}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          loading={isSubmitting}
          disabled={!selectedClientId || !effectiveGstRegistrationId}
        >
          Create Obligation
        </Button>
      </div>
    </form>
  );
};
