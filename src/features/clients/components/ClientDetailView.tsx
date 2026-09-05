import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Edit2,
  Plus,
  Trash2,
  FileCheck,
  Briefcase,
} from 'lucide-react';
import type {
  Client,
  CreateContactPayload,
  CreateEntityPayload,
  CreateGSTRegistrationPayload,
} from '../../../types/client';
import {
  useClient360,
  useAddContactMutation,
  useDeleteContactMutation,
  useCreateEntityMutation,
  useCreateGSTRegistrationMutation,
  useDeactivateClientMutation,
} from '../hooks/useClients';
import {
  Button,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Skeleton,
  Dialog,
  Input,
  Select,
} from '../../../components/ui';

export interface ClientDetailViewProps {
  client: Client;
  onBack: () => void;
  onEdit: () => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  client,
  onBack,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [isAddGSTINOpen, setIsAddGSTINOpen] = useState(false);

  const { data: view360, isLoading } = useClient360(client.id);

  const addContactMutation = useAddContactMutation(client.id);
  const deleteContactMutation = useDeleteContactMutation(client.id);
  const createEntityMutation = useCreateEntityMutation(client.id);
  const createGSTINMutation = useCreateGSTRegistrationMutation(client.id);
  const deactivateClientMutation = useDeactivateClientMutation(client.id);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);

  // Entity Form State
  const [entityLegalName, setEntityLegalName] = useState('');
  const [entityTradeName, setEntityTradeName] = useState('');
  const [entityPan, setEntityPan] = useState('');

  // GSTIN Form State
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [gstinValue, setGstinValue] = useState('');
  const [gstinStateCode, setGstinStateCode] = useState('27');
  const [gstinStateName, setGstinStateName] = useState('Maharashtra');

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;
    const payload: CreateContactPayload = {
      name: contactName.trim(),
      designation: contactDesignation.trim() || undefined,
      email: contactEmail.trim() || undefined,
      phone: contactPhone.trim() || undefined,
      whatsapp_number: contactWhatsapp.trim() || undefined,
      is_primary: isPrimaryContact,
    };
    await addContactMutation.mutateAsync(payload);
    setContactName('');
    setContactDesignation('');
    setContactEmail('');
    setContactPhone('');
    setContactWhatsapp('');
    setIsPrimaryContact(false);
    setIsAddContactOpen(false);
  };

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityLegalName.trim()) return;
    const payload: CreateEntityPayload = {
      client_id: client.id,
      entity_type: client.client_type,
      legal_name: entityLegalName.trim(),
      trade_name: entityTradeName.trim() || undefined,
      pan: entityPan.trim().toUpperCase() || undefined,
    };
    await createEntityMutation.mutateAsync(payload);
    setEntityLegalName('');
    setEntityTradeName('');
    setEntityPan('');
    setIsAddEntityOpen(false);
  };

  const handleCreateGSTIN = async (e: React.FormEvent) => {
    e.preventDefault();
    const entityId = selectedEntityId || (entities[0]?.id ?? '');
    if (!entityId || !gstinValue.trim()) return;
    const selectedEntity = entities.find((ent) => ent.id === entityId);
    const payload: CreateGSTRegistrationPayload = {
      entity_id: entityId,
      gstin: gstinValue.trim().toUpperCase(),
      state_code: gstinStateCode,
      state_name: gstinStateName,
      legal_name: selectedEntity?.legal_name || client.legal_name,
      trade_name: selectedEntity?.trade_name || client.display_name || undefined,
    };
    await createGSTINMutation.mutateAsync(payload);
    setGstinValue('');
    setIsAddGSTINOpen(false);
  };

  const handleDeactivate = async () => {
    if (window.confirm(`Are you sure you want to deactivate ${client.legal_name}?`)) {
      await deactivateClientMutation.mutateAsync();
      onBack();
    }
  };

  const contacts = view360?.contacts || [];
  const entities = view360?.entities || [];
  const gstRegistrations = view360?.gst_registrations || [];

  return (
    <div className="clients-container">
      {/* Back Button & Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="ghost" size="sm" onClick={onBack} iconLeft={<ArrowLeft size={16} />}>
          Back to Directory
        </Button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" onClick={onEdit} iconLeft={<Edit2 size={14} />}>
            Edit Client
          </Button>
          {client.status === 'ACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeactivate}
              loading={deactivateClientMutation.isPending}
              style={{ color: 'var(--color-danger-text)' }}
            >
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* Header Info Card */}
      <div className="client-detail-header-card">
        <div>
          <div className="client-detail-title-group">
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              {client.legal_name}
            </h1>
            <Badge variant={client.status === 'ACTIVE' ? 'success' : 'neutral'} size="md" dot>
              {client.status}
            </Badge>
          </div>
          {client.display_name && client.display_name !== client.legal_name && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
              Trade: <strong>{client.display_name}</strong>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: '6px', border: '1px solid var(--color-slate-200)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
              Client Code
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              {client.client_code}
            </div>
          </div>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: '6px', border: '1px solid var(--color-slate-200)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
              PAN
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              {client.pan || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabList>
          <Tab value="overview">Profile & Identification</Tab>
          <Tab value="contacts">Contacts ({contacts.length})</Tab>
          <Tab value="entities">Entities & GSTIN ({gstRegistrations.length})</Tab>
          <Tab value="modules">Linked Operations</Tab>
        </TabList>

        {/* Tab 1: Profile & Identity */}
        <TabPanel value="overview">
          <div className="clients-filters-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-slate-900)' }}>
              Professional Profile Details
            </h3>
            <div className="client-detail-info-grid">
              <div className="client-info-item">
                <span className="client-info-label">Structure / Type</span>
                <span className="client-info-value">{client.client_type.replace('_', ' ')}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-label">TAN</span>
                <span className="client-info-value" style={{ fontFamily: 'var(--font-mono)' }}>{client.tan || '-'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-label">Primary Email</span>
                <span className="client-info-value">{client.primary_email || '-'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-label">Primary Phone</span>
                <span className="client-info-value">{client.primary_phone || '-'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-label">Assigned Staff</span>
                <span className="client-info-value">{client.assigned_user_name || 'Unassigned'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-label">Relationship Manager</span>
                <span className="client-info-value">{client.relationship_manager_name || 'Unassigned'}</span>
              </div>
              <div className="client-info-item">
                <span className="client-info-label">Primary Financial Year</span>
                <span className="client-info-value">{client.primary_financial_year || '2026-27'}</span>
              </div>
            </div>

            {client.address && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-slate-100)', paddingTop: '0.75rem' }}>
                <span className="client-info-label">Registered Office Address</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                  {client.address}
                </p>
              </div>
            )}

            {client.notes && (
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-slate-100)', paddingTop: '0.75rem' }}>
                <span className="client-info-label">Internal Notes</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                  {client.notes}
                </p>
              </div>
            )}
          </div>
        </TabPanel>

        {/* Tab 2: Contacts */}
        <TabPanel value="contacts">
          <div className="clients-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
                Authorized contact persons and accountants for {client.legal_name}.
              </span>
              <Button variant="outline" size="sm" onClick={() => setIsAddContactOpen(true)} iconLeft={<Plus size={14} />}>
                Add Contact
              </Button>
            </div>

            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {[1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={100} />)}
              </div>
            ) : contacts.length === 0 ? (
              <div className="clients-filters-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
                  No contacts registered for this client yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {contacts.map((contact) => (
                  <div key={contact.id} className="contact-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ color: 'var(--color-slate-900)' }}>{contact.name}</strong>
                          {contact.is_primary && <Badge variant="primary" size="sm">Primary</Badge>}
                        </div>
                        {contact.designation && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                            {contact.designation}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteContactMutation.mutate(contact.id)}
                        style={{ color: 'var(--color-slate-400)', cursor: 'pointer', padding: '0.25rem' }}
                        title="Delete contact"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-slate-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                      {contact.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Mail size={14} style={{ color: 'var(--color-slate-400)' }} />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Phone size={14} style={{ color: 'var(--color-slate-400)' }} />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        {/* Tab 3: Entities & GST Registrations */}
        <TabPanel value="entities">
          <div className="clients-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
                Operating legal entities and state-wise GSTIN registrations.
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setIsAddEntityOpen(true)} iconLeft={<Plus size={14} />}>
                  Add Entity
                </Button>
                {entities.length > 0 && (
                  <Button variant="primary" size="sm" onClick={() => setIsAddGSTINOpen(true)} iconLeft={<Plus size={14} />}>
                    Register GSTIN
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <Skeleton variant="rectangular" height={160} />
            ) : entities.length === 0 ? (
              <div className="clients-filters-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>
                  No operating entities registered. Add a business entity to register GSTINs.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {entities.map((entity) => {
                  const entityGstins =
                    entity.gst_registrations && entity.gst_registrations.length > 0
                      ? entity.gst_registrations
                      : gstRegistrations.filter((g) => g.entity === entity.id);
                  return (
                    <div key={entity.id} className="entity-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: 'var(--color-slate-900)' }}>
                            {entity.legal_name}
                          </strong>
                          {entity.trade_name && (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)', marginLeft: '0.5rem' }}>
                              ({entity.trade_name})
                            </span>
                          )}
                        </div>
                        <Badge variant="neutral" size="sm">{entity.entity_type.replace('_', ' ')}</Badge>
                      </div>

                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                          Registered GSTINs
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                          {entityGstins.length === 0 ? (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-400)' }}>No GSTIN registered</span>
                          ) : (
                            entityGstins.map((gst) => (
                              <span key={gst.id} className="entity-gstin-chip">
                                <Building2 size={12} style={{ color: 'var(--color-primary-600)' }} />
                                {gst.gstin} ({gst.state_code})
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabPanel>

        {/* Tab 4: Linked Operations (Clean Boundary Placeholders) */}
        <TabPanel value="modules">
          <div className="clients-filters-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
              Linked Practice Operations
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', marginBottom: '1rem' }}>
              Domain modules interact with {client.legal_name} through their dedicated operational flows:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', border: '1px solid var(--color-slate-200)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                  <FileCheck size={16} style={{ color: 'var(--color-primary-600)' }} />
                  GST Compliance
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>
                  Statutory obligations, GSTR-1 & 3B periods.
                </p>
              </div>

              <div style={{ padding: '1rem', border: '1px solid var(--color-slate-200)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                  <Briefcase size={16} style={{ color: 'var(--color-primary-600)' }} />
                  Work Queue & Tasks
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>
                  Assigned audit reviews, filing tasks, and document requests.
                </p>
              </div>
            </div>
          </div>
        </TabPanel>
      </Tabs>

      {/* Add Contact Modal */}
      <Dialog
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        title="Add Contact Person"
        description={`Add an authorized contact or accountant for ${client.legal_name}.`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddContactOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAddContact} loading={addContactMutation.isPending}>Add Contact</Button>
          </>
        }
      >
        <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <Input label="Full Name" required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
          <Input label="Designation / Role" value={contactDesignation} onChange={(e) => setContactDesignation(e.target.value)} placeholder="e.g. Chief Accountant" />
          <Input label="Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="ramesh@client.com" />
          <Input label="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 98765 43210" />
          <Input label="WhatsApp Number" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} placeholder="+91 98765 43210" />
        </form>
      </Dialog>

      {/* Add Entity Modal */}
      <Dialog
        isOpen={isAddEntityOpen}
        onClose={() => setIsAddEntityOpen(false)}
        title="Add Operating Entity"
        description={`Register a business or trading entity under ${client.legal_name}.`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddEntityOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateEntity} loading={createEntityMutation.isPending}>Create Entity</Button>
          </>
        }
      >
        <form onSubmit={handleCreateEntity} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <Input label="Legal Entity Name" required value={entityLegalName} onChange={(e) => setEntityLegalName(e.target.value)} placeholder="e.g. ABC Manufacturing Unit 1" />
          <Input label="Trade Name" value={entityTradeName} onChange={(e) => setEntityTradeName(e.target.value)} placeholder="e.g. ABC Solar" />
          <Input label="Entity PAN" maxLength={10} value={entityPan} onChange={(e) => setEntityPan(e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
        </form>
      </Dialog>

      {/* Add GSTIN Modal */}
      <Dialog
        isOpen={isAddGSTINOpen}
        onClose={() => setIsAddGSTINOpen(false)}
        title="Register GSTIN"
        description="Attach a 15-character statutory GST identification number."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddGSTINOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateGSTIN} loading={createGSTINMutation.isPending}>Register GSTIN</Button>
          </>
        }
      >
        <form onSubmit={handleCreateGSTIN} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <Select
            label="Operating Entity"
            required
            value={selectedEntityId || (entities[0]?.id ?? '')}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            options={entities.map((ent) => ({ value: ent.id, label: ent.trade_name ? `${ent.legal_name} (${ent.trade_name})` : ent.legal_name }))}
          />
          <Input
            label="15-Digit GSTIN"
            required
            maxLength={15}
            value={gstinValue}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setGstinValue(val);
              if (val.length >= 2) {
                setGstinStateCode(val.substring(0, 2));
              }
            }}
            placeholder="e.g. 27AAPFU0939F1Z1"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <Input label="State Code" required value={gstinStateCode} onChange={(e) => setGstinStateCode(e.target.value)} />
            <Input label="State Name" required value={gstinStateName} onChange={(e) => setGstinStateName(e.target.value)} />
          </div>
        </form>
      </Dialog>
    </div>
  );
};
