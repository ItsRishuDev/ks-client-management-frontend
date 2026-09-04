import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Download } from 'lucide-react';
import {
  useClientsList,
  useClientDetail,
  useFirmUsers,
  useCreateClientMutation,
  useUpdateClientMutation,
} from '../features/clients/hooks/useClients';
import { ClientTable } from '../features/clients/components/ClientTable';
import { ClientModalForm } from '../features/clients/components/ClientModalForm';
import { ClientDetailView } from '../features/clients/components/ClientDetailView';
import {
  Button,
  Input,
  Select,
  Pagination,
  ErrorState,
} from '../components/ui';
import type { Client, CreateClientPayload, UpdateClientPayload } from '../types/client';

export const ClientsPage: React.FC = () => {
  const { clientId: urlClientId } = useParams<{ clientId?: string }>();
  const navigate = useNavigate();

  // Filter & Search State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [assignedUserFilter, setAssignedUserFilter] = useState('');

  // Modals & Selected Client
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Queries
  const { data: usersData } = useFirmUsers();
  const firmUsers = usersData || [];

  const { data: clientsData, isLoading, isError, refetch } = useClientsList({
    page,
    page_size: 15,
    search: search || undefined,
    status: statusFilter || undefined,
    client_type: typeFilter || undefined,
    assigned_user_id: assignedUserFilter || undefined,
  });

  // Deep-linked client query if urlClientId provided
  const { data: urlClientData } = useClientDetail(urlClientId);
  const activeClient = urlClientData || selectedClient;

  // Mutations
  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation(editingClient?.id || '');

  const handleCreateSubmit = async (payload: CreateClientPayload) => {
    await createMutation.mutateAsync(payload);
  };

  const handleUpdateSubmit = async (payload: UpdateClientPayload) => {
    if (!editingClient) return;
    await updateMutation.mutateAsync(payload);
    setEditingClient(null);
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    navigate(`/clients/${client.id}`);
  };

  const handleBackToList = () => {
    setSelectedClient(null);
    navigate('/clients');
  };

  const handleExportCSV = () => {
    window.open('/api/v1/exports/clients.csv', '_blank');
  };

  if (activeClient) {
    return (
      <ClientDetailView
        client={activeClient}
        onBack={handleBackToList}
        onEdit={() => setEditingClient(activeClient)}
      />
    );
  }

  const clients = clientsData?.items || [];
  const total = clientsData?.total ?? 0;
  const totalPages = Math.ceil(total / (clientsData?.page_size || 15)) || 1;

  return (
    <div className="clients-container">
      {/* 1. Header Section */}
      <div className="clients-header-section">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
            Client Directory
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>
            Manage client profiles, corporate structures, authorized contacts, and statutory GST registrations.
          </p>
        </div>

        <div className="clients-header-actions">
          <Button variant="outline" size="sm" onClick={handleExportCSV} iconLeft={<Download size={14} />}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} iconLeft={<Plus size={16} />}>
            Add Client
          </Button>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="clients-filters-card">
        <div className="clients-filters-grid">
          <Input
            placeholder="Search by legal name, trade name, PAN, or client code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search size={16} />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Entity Types' },
              { value: 'PROPRIETORSHIP', label: 'Proprietorship' },
              { value: 'PRIVATE_LIMITED', label: 'Private Limited' },
              { value: 'LLP', label: 'LLP' },
              { value: 'PARTNERSHIP_FIRM', label: 'Partnership Firm' },
              { value: 'INDIVIDUAL', label: 'Individual' },
            ]}
          />

          <Select
            value={assignedUserFilter}
            onChange={(e) => {
              setAssignedUserFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Staff Members' },
              ...firmUsers.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
        </div>
      </div>

      {/* 3. Table & Error / Empty States */}
      {isError ? (
        <ErrorState
          title="Unable to load clients"
          description="Failed to retrieve client records. Please check your network connection and try again."
          onRetry={refetch}
        />
      ) : (
        <div className="dashboard-section-card">
          <ClientTable
            clients={clients}
            isLoading={isLoading}
            onSelectClient={handleSelectClient}
            onEditClient={(c) => setEditingClient(c)}
          />

          {total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={15}
              totalItems={total}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* Create Modal */}
      <ClientModalForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        users={firmUsers}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Modal */}
      <ClientModalForm
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSubmit={handleUpdateSubmit}
        initialClient={editingClient}
        users={firmUsers}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
};
