import React, { useState } from 'react';
import type {
  Client,
  ClientType,
  CreateClientPayload,
  FirmUserOption,
} from '../../../types/client';
import {
  Dialog,
  Button,
  Input,
  Select,
  Textarea,
} from '../../../components/ui';

export interface ClientModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateClientPayload) => Promise<void>;
  initialClient?: Client | null;
  users: FirmUserOption[];
  isSubmitting: boolean;
}

interface InnerFormProps {
  initialClient?: Client | null;
  users: FirmUserOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateClientPayload) => Promise<void>;
}

const ClientFormInner: React.FC<InnerFormProps> = ({
  initialClient,
  users,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [clientCode, setClientCode] = useState(initialClient?.client_code || '');
  const [legalName, setLegalName] = useState(initialClient?.legal_name || '');
  const [displayName, setDisplayName] = useState(initialClient?.display_name || '');
  const [clientType, setClientType] = useState<ClientType>(initialClient?.client_type || 'PROPRIETORSHIP');
  const [pan, setPan] = useState(initialClient?.pan || '');
  const [tan, setTan] = useState(initialClient?.tan || '');
  const [primaryEmail, setPrimaryEmail] = useState(initialClient?.primary_email || '');
  const [primaryPhone, setPrimaryPhone] = useState(initialClient?.primary_phone || '');
  const [address, setAddress] = useState(initialClient?.address || '');
  const [assignedUser, setAssignedUser] = useState(initialClient?.assigned_user || '');
  const [relationshipManager, setRelationshipManager] = useState(initialClient?.relationship_manager || '');
  const [financialYear, setFinancialYear] = useState(initialClient?.primary_financial_year || '2026-27');
  const [notes, setNotes] = useState(initialClient?.notes || '');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!clientCode.trim()) {
      setFormError('Client code is required.');
      return;
    }
    if (!legalName.trim()) {
      setFormError('Legal name is required.');
      return;
    }

    if (pan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())) {
      setFormError('Invalid PAN format (expected e.g. ABCDE1234F).');
      return;
    }

    const payload: CreateClientPayload = {
      client_code: clientCode.trim().toUpperCase(),
      legal_name: legalName.trim(),
      display_name: displayName.trim() || undefined,
      client_type: clientType,
      pan: pan.trim().toUpperCase() || undefined,
      tan: tan.trim().toUpperCase() || undefined,
      primary_email: primaryEmail.trim() || undefined,
      primary_phone: primaryPhone.trim() || undefined,
      address: address.trim() || undefined,
      assigned_user: assignedUser || null,
      relationship_manager: relationshipManager || null,
      primary_financial_year: financialYear.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save client.');
      }
    }
  };

  const userOptions = [
    { value: '', label: 'Select Assignee (Optional)' },
    ...users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })),
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {formError && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid var(--color-danger-border)', borderRadius: '6px', color: 'var(--color-danger-text)', fontSize: '0.875rem' }} role="alert">
          {formError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Input
          label="Client Code"
          required
          placeholder="e.g. CL-001"
          value={clientCode}
          onChange={(e) => setClientCode(e.target.value.toUpperCase())}
          disabled={isSubmitting}
        />
        <Select
          label="Client Structure / Type"
          required
          value={clientType}
          onChange={(e) => setClientType(e.target.value as ClientType)}
          options={[
            { value: 'PROPRIETORSHIP', label: 'Proprietorship' },
            { value: 'INDIVIDUAL', label: 'Individual' },
            { value: 'PARTNERSHIP_FIRM', label: 'Partnership Firm' },
            { value: 'LLP', label: 'Limited Liability Partnership' },
            { value: 'PRIVATE_LIMITED', label: 'Private Limited Company' },
            { value: 'PUBLIC_LIMITED', label: 'Public Limited Company' },
            { value: 'HUF', label: 'Hindu Undivided Family' },
            { value: 'TRUST', label: 'Trust' },
            { value: 'SOCIETY', label: 'Society' },
            { value: 'OTHER', label: 'Other' },
          ]}
          disabled={isSubmitting}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Input
          label="Legal Name"
          required
          placeholder="Official legal name registered"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          disabled={isSubmitting}
        />
        <Input
          label="Display / Trade Name"
          placeholder="Common operating name (optional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <Input
          label="PAN"
          placeholder="e.g. ABCDE1234F"
          maxLength={10}
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          disabled={isSubmitting}
        />
        <Input
          label="TAN"
          placeholder="e.g. ABCD12345E"
          maxLength={10}
          value={tan}
          onChange={(e) => setTan(e.target.value.toUpperCase())}
          disabled={isSubmitting}
        />
        <Input
          label="Primary Financial Year"
          placeholder="e.g. 2026-27"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Input
          label="Primary Email"
          type="email"
          placeholder="billing@client.com"
          value={primaryEmail}
          onChange={(e) => setPrimaryEmail(e.target.value)}
          disabled={isSubmitting}
        />
        <Input
          label="Primary Phone"
          placeholder="+91 98765 43210"
          value={primaryPhone}
          onChange={(e) => setPrimaryPhone(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Select
          label="Assigned Staff Member"
          value={assignedUser}
          onChange={(e) => setAssignedUser(e.target.value)}
          options={userOptions}
          disabled={isSubmitting}
        />
        <Select
          label="Relationship Manager"
          value={relationshipManager}
          onChange={(e) => setRelationshipManager(e.target.value)}
          options={userOptions}
          disabled={isSubmitting}
        />
      </div>

      <Textarea
        label="Registered Office Address"
        placeholder="Complete billing / operating address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        rows={2}
        disabled={isSubmitting}
      />

      <Textarea
        label="Internal Notes"
        placeholder="Special instructions or notes for this client"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        disabled={isSubmitting}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
        <Button variant="outline" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" loading={isSubmitting}>
          {initialClient ? 'Save Changes' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
};

export const ClientModalForm: React.FC<ClientModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialClient,
  users,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialClient ? 'Edit Client Profile' : 'Add New Client'}
      description={initialClient ? 'Update client identity, pan, contact and assignment.' : 'Register a new client relationship in the firm directory.'}
      size="lg"
    >
      <ClientFormInner
        key={initialClient?.id || 'new'}
        initialClient={initialClient}
        users={users}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
};
