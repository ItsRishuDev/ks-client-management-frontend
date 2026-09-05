import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompliancePage } from '../pages/CompliancePage';
import { AuthContext } from '../context/authContextDef';
import { complianceApi } from '../api/compliance';
import { clientsApi, usersApi } from '../api/clients';
import type { User } from '../types/auth';
import type {
  GSTCompliance,
  PaginatedComplianceResponse,
} from '../types/compliance';
import type {
  ClientListResponse,
  Client360,
  FirmUserOption,
} from '../types/client';

const mockAdminUser: User = {
  id: 'usr-admin-1',
  name: 'CA Suresh Raina',
  email: 'suresh@apex.com',
  role: 'ADMIN',
  permissions: [
    'compliance.view',
    'compliance.update',
    'clients.view',
    'clients.create',
  ],
  firm: {
    id: 'firm-1',
    legal_name: 'Apex Advisory',
    display_name: 'Apex Advisory',
  },
  is_active: true,
};

const mockStaffUser: User = {
  id: 'usr-staff-1',
  name: 'Neha Sharma',
  email: 'neha@apex.com',
  role: 'STAFF',
  permissions: ['compliance.view'],
  firm: {
    id: 'firm-1',
    legal_name: 'Apex Advisory',
    display_name: 'Apex Advisory',
  },
  is_active: true,
};

const mockFirmUsers: FirmUserOption[] = [
  { id: 'usr-admin-1', name: 'CA Suresh Raina', email: 'suresh@apex.com', role: 'ADMIN' },
  { id: 'usr-staff-1', name: 'Neha Sharma', email: 'neha@apex.com', role: 'STAFF' },
];

const mockCompliances: GSTCompliance[] = [
  {
    id: 'comp-1',
    client: 'client-1',
    client_name: 'Acme Industries',
    client_legal_name: 'Acme Industries Private Limited',
    entity: 'ent-1',
    trade_name: 'Acme Plant 1',
    gst_registration: 'gst-1',
    gstin: '27AAAAA0000A1Z5',
    return_type: 'GSTR_3B',
    financial_year: '2026-27',
    tax_period: 'August 2026',
    statutory_due_date: '2026-09-20',
    status: 'DOCUMENTS_PENDING',
    priority: 'HIGH',
    assigned_user: 'usr-staff-1',
    assigned_user_name: 'Neha Sharma',
    notes: 'Awaiting purchase invoices for ITC reconciliation.',
    has_filing: false,
    filing: null,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'comp-2',
    client: 'client-2',
    client_name: 'Bharat Traders',
    client_legal_name: 'Bharat Enterprises',
    entity: 'ent-2',
    trade_name: 'Bharat Traders Main',
    gst_registration: 'gst-2',
    gstin: '23BBBBB0000B1Z6',
    return_type: 'GSTR_1',
    financial_year: '2026-27',
    tax_period: 'August 2026',
    statutory_due_date: '2026-09-11',
    status: 'READY_TO_FILE',
    priority: 'MEDIUM',
    assigned_user: 'usr-admin-1',
    assigned_user_name: 'CA Suresh Raina',
    notes: 'Sales register finalized.',
    has_filing: false,
    filing: null,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-03T10:00:00Z',
  },
  {
    id: 'comp-3',
    client: 'client-1',
    client_name: 'Acme Industries',
    client_legal_name: 'Acme Industries Private Limited',
    entity: 'ent-1',
    trade_name: 'Acme Plant 1',
    gst_registration: 'gst-1',
    gstin: '27AAAAA0000A1Z5',
    return_type: 'GSTR_3B',
    financial_year: '2026-27',
    tax_period: 'July 2026',
    statutory_due_date: '2026-08-20',
    status: 'FILED',
    priority: 'MEDIUM',
    assigned_user: 'usr-staff-1',
    assigned_user_name: 'Neha Sharma',
    notes: 'Filed on time.',
    has_filing: true,
    filing: {
      id: 'filing-1',
      arn: 'AA2708260098765',
      status: 'FILED',
      actual_filing_date: '2026-08-19',
      acknowledgement_number: 'ACK-887766',
      tax_liability: '75000.00',
      cash_paid: '25000.00',
      late_fee: '0.00',
      interest: '0.00',
      verification_date: '2026-08-20',
    },
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-20T10:00:00Z',
  },
];

const mockPaginatedList: PaginatedComplianceResponse = {
  items: mockCompliances,
  page: 1,
  page_size: 15,
  total: 3,
};

const mockClientsList: ClientListResponse = {
  items: [
    {
      id: 'client-1',
      client_code: 'CL-001',
      client_type: 'PRIVATE_LIMITED',
      legal_name: 'Acme Industries Private Limited',
      display_name: 'Acme Industries',
      pan: 'ABCDE1234F',
      tan: 'BLRA12345E',
      primary_email: 'finance@acme.com',
      primary_phone: '+91 98765 43210',
      address: '123 MG Road, Bengaluru',
      primary_financial_year: '2026-27',
      status: 'ACTIVE',
      notes: '',
      gstin_count: 1,
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z',
    },
  ],
  page: 1,
  page_size: 100,
  total: 1,
};

const mockClient360: Client360 = {
  client: mockClientsList.items[0],
  contacts: [],
  entities: [
    {
      id: 'ent-1',
      legal_name: 'Acme Industries Private Limited',
      trade_name: 'Acme Plant 1',
      entity_type: 'PRIVATE_LIMITED',
      pan: 'ABCDE1234F',
      tan: '',
      address: '',
      status: 'ACTIVE',
      notes: '',
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-01-10T10:00:00Z',
    },
  ],
  gst_registrations: [
    {
      id: 'gst-1',
      gstin: '27AAAAA0000A1Z5',
      state_code: '27',
      state_name: 'Maharashtra',
      legal_name: 'Acme Industries Private Limited',
      trade_name: 'Acme Plant 1',
      taxpayer_type: 'REGULAR',
      registration_status: 'ACTIVE',
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-01-10T10:00:00Z',
    },
  ],
  compliance: [],
  documents: {},
  services: [],
  tasks: [],
  billing: {
    total_invoiced: '0.00',
    total_collected: '0.00',
    outstanding: '0.00',
  },
};

const renderWithProviders = (
  initialEntries = ['/compliance'],
  currentUser: User = mockAdminUser
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: currentUser,
          isAuthenticated: !!currentUser,
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          refreshUser: vi.fn(),
          clearError: vi.fn(),
        }}
      >
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/compliance/:complianceId" element={<CompliancePage />} />
            <Route path="/clients/:clientId" element={<div>Client 360 Mock</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('GST Compliance Vertical Slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(complianceApi, 'list').mockResolvedValue(mockPaginatedList);
    vi.spyOn(complianceApi, 'get').mockImplementation(async (id: string) => {
      const found = mockCompliances.find((c) => c.id === id);
      if (!found) throw new Error('Not found');
      return found;
    });
    vi.spyOn(complianceApi, 'create').mockImplementation(async (payload) => ({
      id: 'comp-new',
      client: 'client-1',
      client_name: 'Acme Industries',
      client_legal_name: 'Acme Industries Private Limited',
      entity: 'ent-1',
      trade_name: 'Acme Plant 1',
      gst_registration: payload.gst_registration_id,
      gstin: '27AAAAA0000A1Z5',
      return_type: payload.return_type,
      financial_year: payload.financial_year,
      tax_period: payload.tax_period,
      statutory_due_date: payload.statutory_due_date,
      status: payload.status || 'UPCOMING',
      priority: payload.priority || 'MEDIUM',
      notes: payload.notes || '',
      created_at: '2026-09-05T12:00:00Z',
      updated_at: '2026-09-05T12:00:00Z',
    }));
    vi.spyOn(complianceApi, 'update').mockImplementation(async (id, payload) => {
      const found = mockCompliances.find((c) => c.id === id);
      return {
        ...(found || mockCompliances[0]),
        ...payload,
        status: payload.status || found?.status || 'UPCOMING',
        priority: payload.priority || found?.priority || 'MEDIUM',
        notes: payload.notes !== undefined ? payload.notes : found?.notes || '',
      };
    });

    vi.spyOn(usersApi, 'list').mockResolvedValue(mockFirmUsers);
    vi.spyOn(clientsApi, 'list').mockResolvedValue(mockClientsList);
    vi.spyOn(clientsApi, 'get360').mockResolvedValue(mockClient360);
  });

  it('1. Renders compliance register header, quick filter pills, and obligations table', async () => {
    renderWithProviders();

    expect(await screen.findByText('GST Compliance Register')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All Obligations' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Due This Week' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ready to File' })).toBeInTheDocument();

    // Verify obligations in table
    const acmeItems = await screen.findAllByText('Acme Industries');
    expect(acmeItems.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bharat Traders')).toBeInTheDocument();
    expect(screen.getAllByText('27AAAAA0000A1Z5').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('23BBBBB0000B1Z6')).toBeInTheDocument();
    expect(screen.getByText('DOCS PENDING')).toBeInTheDocument();
    expect(screen.getByText('READY TO FILE')).toBeInTheDocument();
  });

  it('2. Filters compliance obligations by return type', async () => {
    renderWithProviders();

    await screen.findByText('GST Compliance Register');

    const selectInputs = screen.getAllByRole('combobox');
    const returnTypeSelect = selectInputs[0]; // First select is Return Type

    fireEvent.change(returnTypeSelect, { target: { value: 'GSTR_1' } });

    await waitFor(() => {
      expect(complianceApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ return_type: 'GSTR_1' })
      );
    });
  });

  it('3. Renders empty state when no compliance obligations match filter', async () => {
    vi.spyOn(complianceApi, 'list').mockResolvedValueOnce({
      items: [],
      page: 1,
      page_size: 15,
      total: 0,
    });

    renderWithProviders();

    expect(await screen.findByText('No compliance obligations found')).toBeInTheDocument();
  });

  it('4. Navigates to compliance detail view when clicking Details button', async () => {
    renderWithProviders();

    const detailButtons = await screen.findAllByRole('button', { name: /Details/i });
    fireEvent.click(detailButtons[0]);

    // Detail view rendered
    expect(await screen.findByText('Back to Compliance Register')).toBeInTheDocument();
    expect(screen.getByText(/GSTR-3B — August 2026/)).toBeInTheDocument();
    expect(screen.getByText('Compliance Lifecycle Progression')).toBeInTheDocument();
    expect(screen.getByText('Obligation Details')).toBeInTheDocument();
    expect(screen.getByText('Client & Operating Entity')).toBeInTheDocument();
  });

  it('5. Deep links directly into a compliance detail view via URL', async () => {
    renderWithProviders(['/compliance/comp-3']);

    expect(await screen.findByText(/GSTR-3B — July 2026/)).toBeInTheDocument();
    expect(screen.getByText('Return Recorded as Filed')).toBeInTheDocument();
    expect(screen.getByText('AA2708260098765')).toBeInTheDocument();
    expect(screen.getByText('₹75000.00')).toBeInTheDocument();
    expect(screen.getByText('₹25000.00')).toBeInTheDocument();
  });

  it('6. Advances status via available quick workflow action button', async () => {
    renderWithProviders(['/compliance/comp-1']);

    await screen.findByText(/GSTR-3B — August 2026/);

    // comp-1 is DOCUMENTS_PENDING -> allowed: DATA_RECEIVED, IN_PREPARATION, OVERDUE
    const advanceBtn = screen.getByRole('button', { name: /DATA RECEIVED/i });
    fireEvent.click(advanceBtn);

    await waitFor(() => {
      expect(complianceApi.update).toHaveBeenCalledWith('comp-1', {
        status: 'DATA_RECEIVED',
      });
    });
  });

  it('7. Opens status modal and submits updated notes and priority', async () => {
    renderWithProviders(['/compliance/comp-1']);

    await screen.findByText(/GSTR-3B — August 2026/);

    const editBtn = screen.getByRole('button', { name: /Update Workflow & Details/i });
    fireEvent.click(editBtn);

    expect(await screen.findByText(/Update Compliance — GSTR-3B/i)).toBeInTheDocument();

    const notesTextarea = screen.getByPlaceholderText(/Add progress notes/i);
    fireEvent.change(notesTextarea, { target: { value: 'Purchase register audited and cleared.' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(complianceApi.update).toHaveBeenCalledWith(
        'comp-1',
        expect.objectContaining({
          notes: 'Purchase register audited and cleared.',
        })
      );
    });
  });

  it('8. Creates new compliance obligation via modal with client & GSTIN selection', async () => {
    renderWithProviders();

    await screen.findByText('GST Compliance Register');

    const addBtn = screen.getByRole('button', { name: /Add Obligation/i });
    fireEvent.click(addBtn);

    expect(await screen.findByText('Create GST Compliance Obligation')).toBeInTheDocument();

    // Select Client (wait for client query to finish)
    const clientSelect = await screen.findByLabelText(/Client/i);
    fireEvent.change(clientSelect, { target: { value: 'client-1' } });

    // GSTIN is auto-selected from client 360
    await waitFor(() => {
      expect(screen.getByLabelText(/GST Registration/i)).toHaveValue('gst-1');
    });

    const submitBtn = screen.getByRole('button', { name: /Create Obligation/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(complianceApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gst_registration_id: 'gst-1',
          return_type: 'GSTR_3B',
          financial_year: '2026-27',
        })
      );
    });
  });

  it('9. Hides Add Obligation button for user without compliance.update permission', async () => {
    renderWithProviders(['/compliance'], mockStaffUser);

    expect(await screen.findByText('GST Compliance Register')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add Obligation/i })).not.toBeInTheDocument();
  });
});
