import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { userHasPermission } from '../utils/permissions';
import {
  useComplianceList,
  useComplianceDetail,
  useCreateComplianceMutation,
  useUpdateComplianceMutation,
} from '../features/compliance/hooks/useCompliance';
import { useFirmUsers } from '../features/clients/hooks/useClients';
import { ComplianceTable } from '../features/compliance/components/ComplianceTable';
import { ComplianceDetailView } from '../features/compliance/components/ComplianceDetailView';
import { ComplianceModalForm } from '../features/compliance/components/ComplianceModalForm';
import { ComplianceStatusModal } from '../features/compliance/components/ComplianceStatusModal';
import {
  Button,
  Input,
  Select,
  Pagination,
  ErrorState,
} from '../components/ui';
import type {
  GSTCompliance,
  CreateCompliancePayload,
  UpdateCompliancePayload,
} from '../types/compliance';

type QuickPillFilter = 'all' | 'due_this_week' | 'overdue' | 'documents_pending' | 'ready_to_file';

export const CompliancePage: React.FC = () => {
  const { user } = useAuth();
  const { complianceId: urlComplianceId } = useParams<{ complianceId?: string }>();
  const navigate = useNavigate();

  const canUpdate = userHasPermission(user, 'compliance.update');

  // Filter & Search State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [returnTypeFilter, setReturnTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedUserFilter, setAssignedUserFilter] = useState('');
  const [quickPill, setQuickPill] = useState<QuickPillFilter>('all');

  // Selected Compliance & Modals
  const [selectedCompliance, setSelectedCompliance] = useState<GSTCompliance | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusModalComp, setStatusModalComp] = useState<GSTCompliance | null>(null);

  // Queries
  const { data: usersData } = useFirmUsers();
  const firmUsers = usersData || [];

  const listParams = {
    page,
    page_size: 15,
    search: search || undefined,
    return_type: returnTypeFilter || undefined,
    status: quickPill === 'ready_to_file' ? 'READY_TO_FILE' : statusFilter || undefined,
    priority: priorityFilter || undefined,
    assigned_user_id: assignedUserFilter || undefined,
    due_this_week: quickPill === 'due_this_week' ? true : undefined,
    overdue: quickPill === 'overdue' ? true : undefined,
    documents_pending: quickPill === 'documents_pending' ? true : undefined,
  };

  const {
    data: complianceData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useComplianceList(listParams);

  // Deep-linked query if urlComplianceId is set
  const { data: urlCompData, isLoading: isLoadingDetail } = useComplianceDetail(urlComplianceId);
  const activeCompliance = urlCompData || selectedCompliance;

  // Mutations
  const createMutation = useCreateComplianceMutation();
  const updateMutation = useUpdateComplianceMutation(statusModalComp?.id || activeCompliance?.id || '');

  const handleCreateSubmit = async (payload: CreateCompliancePayload) => {
    await createMutation.mutateAsync(payload);
  };

  const handleUpdateStatus = async (complianceId: string, payload: UpdateCompliancePayload) => {
    await updateMutation.mutateAsync(payload);
    if (statusModalComp && statusModalComp.id === complianceId) {
      setStatusModalComp(null);
    }
  };

  const handleSelectCompliance = (comp: GSTCompliance) => {
    setSelectedCompliance(comp);
    navigate(`/compliance/${comp.id}`);
  };

  const handleBackToList = () => {
    setSelectedCompliance(null);
    navigate('/compliance');
  };

  const handleQuickPillChange = (pill: QuickPillFilter) => {
    setQuickPill(pill);
    setPage(1);
    if (pill === 'ready_to_file') {
      setStatusFilter('READY_TO_FILE');
    } else if (pill === 'documents_pending') {
      setStatusFilter('DOCUMENTS_PENDING');
    } else {
      setStatusFilter('');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setReturnTypeFilter('');
    setStatusFilter('');
    setPriorityFilter('');
    setAssignedUserFilter('');
    setQuickPill('all');
    setPage(1);
  };

  // Render Detail View if an item is active
  if (activeCompliance) {
    return (
      <ComplianceDetailView
        compliance={activeCompliance}
        onBack={handleBackToList}
        onUpdateStatus={handleUpdateStatus}
        users={firmUsers}
        canUpdate={canUpdate}
        isUpdating={updateMutation.isPending}
      />
    );
  }

  const compliances = complianceData?.items || [];
  const total = complianceData?.total ?? 0;
  const totalPages = Math.ceil(total / (complianceData?.page_size || 15)) || 1;

  const returnTypeOptions = [
    { value: '', label: 'All Return Types' },
    { value: 'GSTR_1', label: 'GSTR-1' },
    { value: 'GSTR_3B', label: 'GSTR-3B' },
    { value: 'CMP_08', label: 'CMP-08' },
    { value: 'GSTR_4', label: 'GSTR-4' },
    { value: 'GSTR_9', label: 'GSTR-9' },
    { value: 'GSTR_9C', label: 'GSTR-9C' },
    { value: 'IFF', label: 'IFF' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'DOCUMENTS_PENDING', label: 'Documents Pending' },
    { value: 'DATA_RECEIVED', label: 'Data Received' },
    { value: 'IN_PREPARATION', label: 'In Preparation' },
    { value: 'PREPARED', label: 'Prepared' },
    { value: 'READY_TO_FILE', label: 'Ready to File' },
    { value: 'FILED', label: 'Filed' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'LATE', label: 'Late Filed' },
    { value: 'DEFECTIVE', label: 'Defective' },
    { value: 'REVISED', label: 'Revised' },
    { value: 'NOT_DUE', label: 'Not Due' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const userFilterOptions = [
    { value: '', label: 'All Assignees' },
    ...firmUsers.map((u) => ({
      value: u.id,
      label: u.name,
    })),
  ];

  return (
    <div className="compliance-container">
      {/* 1. Header Section */}
      <div className="compliance-header-section">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Layers size={22} style={{ color: 'var(--color-primary-600)' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              GST Compliance Register
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', marginTop: '0.25rem' }}>
            Practice-wide tracking of GST return obligations, periodic deadlines, and filing readiness.
          </p>
        </div>

        <div className="compliance-header-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            loading={isFetching}
            iconLeft={<RefreshCw size={14} />}
          >
            Refresh
          </Button>

          {canUpdate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              iconLeft={<Plus size={14} />}
            >
              Add Obligation
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filters & Quick Pills Card */}
      <div className="compliance-filters-card">
        {/* Quick Filter Pills */}
        <div className="compliance-quick-pills">
          <button
            type="button"
            className={`compliance-pill ${quickPill === 'all' ? 'compliance-pill--active' : ''}`}
            onClick={() => handleQuickPillChange('all')}
          >
            All Obligations
          </button>
          <button
            type="button"
            className={`compliance-pill ${quickPill === 'due_this_week' ? 'compliance-pill--active' : ''}`}
            onClick={() => handleQuickPillChange('due_this_week')}
          >
            Due This Week
          </button>
          <button
            type="button"
            className={`compliance-pill ${quickPill === 'overdue' ? 'compliance-pill--active' : ''}`}
            onClick={() => handleQuickPillChange('overdue')}
          >
            Overdue
          </button>
          <button
            type="button"
            className={`compliance-pill ${quickPill === 'documents_pending' ? 'compliance-pill--active' : ''}`}
            onClick={() => handleQuickPillChange('documents_pending')}
          >
            Documents Pending
          </button>
          <button
            type="button"
            className={`compliance-pill ${quickPill === 'ready_to_file' ? 'compliance-pill--active' : ''}`}
            onClick={() => handleQuickPillChange('ready_to_file')}
          >
            Ready to File
          </button>
        </div>

        {/* Detailed Filter Grid */}
        <div className="compliance-filters-grid">
          <Input
            placeholder="Search by client, GSTIN, period..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search size={16} />}
          />

          <Select
            value={returnTypeFilter}
            onChange={(e) => {
              setReturnTypeFilter(e.target.value);
              setPage(1);
            }}
            options={returnTypeOptions}
          />

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setQuickPill('all');
              setPage(1);
            }}
            options={statusOptions}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            options={priorityOptions}
          />

          <Select
            value={assignedUserFilter}
            onChange={(e) => {
              setAssignedUserFilter(e.target.value);
              setPage(1);
            }}
            options={userFilterOptions}
          />

          {(search || returnTypeFilter || statusFilter || priorityFilter || assignedUserFilter || quickPill !== 'all') && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 3. Primary Table / Error / Loading States */}
      {isError ? (
        <ErrorState
          title="Unable to load GST compliance records"
          description="Failed to fetch compliance obligations from the firm database. Please verify your connection."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="clients-filters-card" style={{ padding: 0, overflow: 'hidden' }}>
          <ComplianceTable
            compliances={compliances}
            isLoading={isLoading || isLoadingDetail}
            onSelectCompliance={handleSelectCompliance}
            onStatusChangeClick={canUpdate ? (comp) => setStatusModalComp(comp) : undefined}
          />

          {total > 0 && (
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--color-slate-200)' }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={total}
                pageSize={complianceData?.page_size || 15}
              />
            </div>
          )}
        </div>
      )}

      {/* 4. Modals */}
      <ComplianceModalForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        users={firmUsers}
        isSubmitting={createMutation.isPending}
      />

      <ComplianceStatusModal
        isOpen={!!statusModalComp}
        onClose={() => setStatusModalComp(null)}
        compliance={statusModalComp}
        users={firmUsers}
        onUpdate={handleUpdateStatus}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
};

