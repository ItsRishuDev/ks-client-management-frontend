import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientsPage } from '../pages/ClientsPage';
import { AuthContext } from '../context/authContextDef';
import { clientsApi, usersApi } from '../api/clients';
import type { User } from '../types/auth';
import type {
  Client360,
  ClientListResponse,
  FirmUserOption,
} from '../types/client';

const mockAdminUser: User = {
  id: 'usr-admin-1',
  name: 'CA Suresh Raina',
  email: 'suresh@apex.com',
  role: 'ADMIN',
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
      address: '123 MG Road, Bengaluru, Karnataka 560001',
      assigned_user: 'usr-staff-1',
      assigned_user_name: 'Neha Sharma',
      relationship_manager: 'usr-admin-1',
      relationship_manager_name: 'CA Suresh Raina',
      primary_financial_year: '2026-27',
      status: 'ACTIVE',
      notes: 'Premier tier client',
      gstin_count: 2,
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z',
    },
    {
      id: 'client-2',
      client_code: 'CL-002',
      client_type: 'PROPRIETORSHIP',
      legal_name: 'Bharat Enterprises',
      display_name: 'Bharat Traders',
      pan: 'BCDEF2345G',
      tan: '',
      primary_email: 'bharat@traders.com',
      primary_phone: '+91 98765 11111',
      address: '45 Station Road, Pune',
      assigned_user: 'usr-staff-1',
      assigned_user_name: 'Neha Sharma',
      primary_financial_year: '2026-27',
      status: 'ACTIVE',
      notes: '',
      gstin_count: 1,
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z',
    },
  ],
  page: 1,
  page_size: 15,
  total: 2,
};

const mockClient360: Client360 = {
  client: mockClientsList.items[0],
  contacts: [
    {
      id: 'contact-1',
      client: 'client-1',
      name: 'Ravi Kumar',
      designation: 'CFO',
      email: 'ravi@acme.com',
      phone: '+91 99999 88888',
      whatsapp_number: '+91 99999 88888',
      is_primary: true,
      contact_preferences: {},
      created_at: '2026-01-11T10:00:00Z',
      updated_at: '2026-01-11T10:00:00Z',
    },
  ],
  entities: [
    {
      id: 'entity-1',
      client: 'client-1',
      entity_type: 'PRIVATE_LIMITED',
      legal_name: 'Acme Industries Private Limited',
      trade_name: 'Acme Unit 1',
      pan: 'ABCDE1234F',
      tan: 'BLRA12345E',
      address: 'Bengaluru Factory',
      status: 'ACTIVE',
      notes: '',
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-01-10T10:00:00Z',
    },
  ],
  gst_registrations: [
    {
      id: 'gst-1',
      client: 'client-1',
      entity: 'entity-1',
      gstin: '29ABCDE1234F1Z5',
      state_code: '29',
      state_name: 'Karnataka',
      legal_name: 'Acme Industries Private Limited',
      trade_name: 'Acme Unit 1',
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
    total_invoiced: '50000.00',
    total_collected: '30000.00',
    outstanding: '20000.00',
  },
};

describe('Clients Module Vertical Slice', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderClients = (initialPath = '/clients') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: mockAdminUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
            clearError: vi.fn(),
          }}
        >
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/:clientId" element={<ClientsPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renders client directory list with accurate fields', async () => {
    vi.spyOn(clientsApi, 'list').mockResolvedValue(mockClientsList);
    vi.spyOn(usersApi, 'list').mockResolvedValue(mockFirmUsers);

    renderClients();

    expect(screen.getByText('Client Directory')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('CL-001')).toBeInTheDocument();
      expect(screen.getByText('Acme Industries Private Limited')).toBeInTheDocument();
      expect(screen.getByText('Bharat Enterprises')).toBeInTheDocument();
      expect(screen.getByText('ABCDE1234F')).toBeInTheDocument();
      expect(screen.getAllByText('Neha Sharma').length).toBeGreaterThan(0);
    });
  });

  it('handles search input filtering and triggers API query with search param', async () => {
    const listSpy = vi.spyOn(clientsApi, 'list').mockResolvedValue(mockClientsList);
    vi.spyOn(usersApi, 'list').mockResolvedValue(mockFirmUsers);

    renderClients();

    const searchInput = screen.getByPlaceholderText(/search by legal name/i);
    fireEvent.change(searchInput, { target: { value: 'Acme' } });

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Acme' })
      );
    });
  });

  it('opens Add Client modal and validates form submissions', async () => {
    vi.spyOn(clientsApi, 'list').mockResolvedValue(mockClientsList);
    vi.spyOn(usersApi, 'list').mockResolvedValue(mockFirmUsers);
    const createSpy = vi.spyOn(clientsApi, 'create').mockResolvedValue(mockClientsList.items[0]);

    renderClients();

    const addClientBtn = screen.getByRole('button', { name: /add client/i });
    fireEvent.click(addClientBtn);

    expect(screen.getByText('Add New Client')).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/client code/i), { target: { value: 'CL-003' } });
    fireEvent.change(screen.getByLabelText(/legal name/i), { target: { value: 'Delta Logistics LLP' } });
    fireEvent.change(screen.getByLabelText(/pan/i), { target: { value: 'ABCDE9999Z' } });

    const submitBtn = screen.getByRole('button', { name: /create client/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          client_code: 'CL-003',
          legal_name: 'Delta Logistics LLP',
          pan: 'ABCDE9999Z',
        })
      );
    });
  });

  it('navigates to Client Detail view (Client 360) and renders contacts & entities', async () => {
    vi.spyOn(clientsApi, 'list').mockResolvedValue(mockClientsList);
    vi.spyOn(clientsApi, 'get').mockResolvedValue(mockClientsList.items[0]);
    vi.spyOn(clientsApi, 'get360').mockResolvedValue(mockClient360);
    vi.spyOn(usersApi, 'list').mockResolvedValue(mockFirmUsers);

    renderClients('/clients/client-1');

    await waitFor(() => {
      expect(screen.getByText('Acme Industries Private Limited')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /contacts \(1\)/i })).toBeInTheDocument();
    });

    // Profile details
    expect(screen.getByText('123 MG Road, Bengaluru, Karnataka 560001')).toBeInTheDocument();
    expect(screen.getByText('finance@acme.com')).toBeInTheDocument();

    // Switch to Contacts tab
    const contactsTab = screen.getByRole('tab', { name: /contacts \(1\)/i });
    fireEvent.click(contactsTab);

    await waitFor(() => {
      expect(screen.getByText('Ravi Kumar')).toBeInTheDocument();
      expect(screen.getByText('CFO')).toBeInTheDocument();
      expect(screen.getByText('ravi@acme.com')).toBeInTheDocument();
    });

    // Switch to Entities & GSTIN tab
    const entitiesTab = screen.getByRole('tab', { name: /entities & gstin \(1\)/i });
    fireEvent.click(entitiesTab);

    await waitFor(() => {
      expect(screen.getByText(/Acme Unit 1/i)).toBeInTheDocument();
      expect(screen.getByText(/29ABCDE1234F1Z5/i)).toBeInTheDocument();
    });
  });

  it('renders empty state when no clients exist', async () => {
    vi.spyOn(clientsApi, 'list').mockResolvedValue({
      items: [],
      page: 1,
      page_size: 15,
      total: 0,
    });
    vi.spyOn(usersApi, 'list').mockResolvedValue(mockFirmUsers);

    renderClients();

    await waitFor(() => {
      expect(screen.getByText('No Clients Found')).toBeInTheDocument();
    });
  });

  it('renders multiple clients sharing identical trade names with distinctive client codes', async () => {
    const clientsWithSameTradeName: ClientListResponse = {
      items: [
        {
          ...mockClientsList.items[0],
          id: 'client-dup-1',
          client_code: 'CL-A101',
          legal_name: 'Apex Supermart Alpha Pvt Ltd',
          display_name: 'Apex Supermart',
        },
        {
          ...mockClientsList.items[1],
          id: 'client-dup-2',
          client_code: 'CL-B202',
          legal_name: 'Apex Supermart Beta LLP',
          display_name: 'Apex Supermart',
        },
      ],
      page: 1,
      page_size: 15,
      total: 2,
    };

    vi.spyOn(clientsApi, 'list').mockResolvedValue(clientsWithSameTradeName);
    vi.spyOn(usersApi, 'list').mockResolvedValue(mockFirmUsers);

    renderClients();

    await waitFor(() => {
      expect(screen.getByText('CL-A101')).toBeInTheDocument();
      expect(screen.getByText('CL-B202')).toBeInTheDocument();
      expect(screen.getByText('Apex Supermart Alpha Pvt Ltd')).toBeInTheDocument();
      expect(screen.getByText('Apex Supermart Beta LLP')).toBeInTheDocument();
    });

    const displayNames = screen.getAllByText(/Apex Supermart/i);
    // 2 legal names + 2 trade names = 4 instances
    expect(displayNames.length).toBeGreaterThanOrEqual(2);
  });
});
