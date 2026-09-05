import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BillingPage } from '../pages/BillingPage';
import { AuthContext } from '../context/authContextDef';
import { ToastProvider } from '../components/ui/Toast';
import { invoicesApi, paymentsApi } from '../api/billing';
import { clientsApi } from '../api/clients';
import type { User } from '../types/auth';
import type { InvoiceListResponse, PaymentListResponse } from '../types/billing';
import type { ClientListResponse } from '../types/client';

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
  permissions: ['invoices.create', 'payments.record', 'clients.view'],
};

const mockStaffUser: User = {
  id: 'usr-staff-1',
  name: 'Neha Sharma',
  email: 'neha@apex.com',
  role: 'STAFF',
  firm: {
    id: 'firm-1',
    legal_name: 'Apex Advisory',
    display_name: 'Apex Advisory',
  },
  is_active: true,
  permissions: ['clients.view'],
};

const mockInvoicesList: InvoiceListResponse = {
  items: [
    {
      id: 'inv-1',
      firm: 'firm-1',
      client: 'client-1',
      client_name: 'Acme Industries',
      entity: null,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-09-01',
      due_date: '2026-09-15',
      status: 'SENT',
      subtotal: '10000.00',
      discount: '0.00',
      taxable_amount: '10000.00',
      cgst: '900.00',
      sgst: '900.00',
      igst: '0.00',
      total_amount: '11800.00',
      total_allocated: '5000.00',
      outstanding_balance: '6800.00',
      notes: 'Monthly compliance retainer',
      items: [
        {
          id: 'item-1',
          service_id: null,
          description: 'Monthly GST Retainer',
          sac_hsn: '9982',
          quantity: '1.000',
          unit_price: '10000.00',
          taxable_amount: '10000.00',
          gst_rate: '18.00',
          cgst: '900.00',
          sgst: '900.00',
          igst: '0.00',
          total: '11800.00',
          created_at: '2026-09-01T10:00:00Z',
        },
      ],
      created_by: 'usr-admin-1',
      created_by_name: 'CA Suresh Raina',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z',
    },
    {
      id: 'inv-2',
      firm: 'firm-1',
      client: 'client-1',
      client_name: 'Acme Industries',
      entity: null,
      invoice_number: 'INV-2026-0002',
      invoice_date: '2026-09-02',
      due_date: '2026-09-16',
      status: 'DRAFT',
      subtotal: '5000.00',
      discount: '500.00',
      taxable_amount: '5000.00',
      cgst: '450.00',
      sgst: '450.00',
      igst: '0.00',
      total_amount: '5400.00',
      total_allocated: '0.00',
      outstanding_balance: '5400.00',
      notes: 'Audit services',
      items: [],
      created_by: 'usr-admin-1',
      created_by_name: 'CA Suresh Raina',
      created_at: '2026-09-02T10:00:00Z',
      updated_at: '2026-09-02T10:00:00Z',
    },
  ],
  page: 1,
  page_size: 25,
  total: 2,
};

const mockPaymentsList: PaymentListResponse = {
  items: [
    {
      id: 'pmt-1',
      firm: 'firm-1',
      client: 'client-1',
      client_name: 'Acme Industries',
      payment_date: '2026-09-03',
      amount: '5000.00',
      payment_mode: 'NEFT',
      transaction_reference: 'NEFT987654321',
      notes: 'Part payment against INV-2026-0001',
      total_allocated: '5000.00',
      unallocated_amount: '0.00',
      allocations: [
        {
          id: 'alloc-1',
          firm: 'firm-1',
          payment: 'pmt-1',
          invoice: 'inv-1',
          invoice_number: 'INV-2026-0001',
          allocated_amount: '5000.00',
          allocation_date: '2026-09-03',
          created_at: '2026-09-03T11:00:00Z',
        },
      ],
      recorded_by: 'usr-admin-1',
      recorded_by_name: 'CA Suresh Raina',
      created_at: '2026-09-03T11:00:00Z',
      updated_at: '2026-09-03T11:00:00Z',
    },
  ],
  page: 1,
  page_size: 25,
  total: 1,
};

const mockClientsList: ClientListResponse = {
  items: [
    {
      id: 'client-1',
      firm: 'firm-1',
      client_code: 'CL-001',
      client_type: 'PRIVATE_LIMITED',
      legal_name: 'Acme Industries Private Limited',
      display_name: 'Acme Industries',
      pan: 'ABCDE1234F',
      tan: 'ABCD12345E',
      primary_email: 'info@acme.com',
      primary_phone: '9876543210',
      address: 'Mumbai, India',
      primary_financial_year: '2025-2026',
      status: 'ACTIVE',
      notes: '',
      gstin_count: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ],
  page: 1,
  page_size: 25,
  total: 1,
};

vi.mock('../api/billing', () => ({
  invoicesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    send: vi.fn(),
    cancel: vi.fn(),
  },
  paymentsApi: {
    list: vi.fn(),
    get: vi.fn(),
    record: vi.fn(),
    getAllocations: vi.fn(),
  },
}));

vi.mock('../api/clients', () => ({
  clientsApi: {
    list: vi.fn(),
    get: vi.fn(),
    getGstRegistrations: vi.fn(),
    getEntities: vi.fn(),
  },
  usersApi: {
    list: vi.fn(),
  },
}));

const renderBillingPage = (user: User = mockAdminUser) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          refreshUser: vi.fn(),
          clearError: vi.fn(),
        }}
      >
        <ToastProvider>
          <MemoryRouter>
            <BillingPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('BillingPage & Billing Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoicesApi.list).mockResolvedValue(mockInvoicesList);
    vi.mocked(invoicesApi.get).mockImplementation((id: string) =>
      Promise.resolve(mockInvoicesList.items.find((i) => i.id === id) || mockInvoicesList.items[0])
    );
    vi.mocked(invoicesApi.send).mockResolvedValue({ ...mockInvoicesList.items[1], status: 'SENT' });
    vi.mocked(invoicesApi.cancel).mockResolvedValue({ ...mockInvoicesList.items[1], status: 'CANCELLED' });
    vi.mocked(paymentsApi.list).mockResolvedValue(mockPaymentsList);
    vi.mocked(paymentsApi.getAllocations).mockResolvedValue(mockPaymentsList.items[0].allocations);
    vi.mocked(clientsApi.list).mockResolvedValue(mockClientsList);
  });

  it('renders billing header, financial KPIs, and invoice table', async () => {
    renderBillingPage(mockAdminUser);

    expect(screen.getByText('Billing & Receivables')).toBeInTheDocument();
    expect(screen.getByText('Outstanding Balance')).toBeInTheDocument();
    expect(screen.getByText('Total Invoiced')).toBeInTheDocument();
    expect(screen.getByText('Total Collected')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('INV-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-0002')).toBeInTheDocument();
    });
  });

  it('enforces permission gating for staff users (no Create or Record buttons)', async () => {
    renderBillingPage(mockStaffUser);

    await waitFor(() => {
      expect(screen.queryByText('+ Create Invoice')).not.toBeInTheDocument();
      expect(screen.queryByText('+ Record Payment')).not.toBeInTheDocument();
    });
  });

  it('allows admin users to see action buttons and open modals', async () => {
    renderBillingPage(mockAdminUser);

    expect(screen.getByText('+ Create Invoice')).toBeInTheDocument();
    expect(screen.getByText('+ Record Payment')).toBeInTheDocument();

    fireEvent.click(screen.getByText('+ Create Invoice'));
    expect(screen.getByText('Create New Invoice')).toBeInTheDocument();
  });

  it('switches to payments tab and displays recorded payments', async () => {
    renderBillingPage(mockAdminUser);

    const paymentsTabBtn = screen.getByRole('button', { name: /Payments/i });
    fireEvent.click(paymentsTabBtn);

    await waitFor(() => {
      expect(screen.getByText('NEFT987654321')).toBeInTheDocument();
      expect(screen.getAllByText('NEFT').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('sends a draft invoice when send button is clicked', async () => {
    renderBillingPage(mockAdminUser);

    await waitFor(() => {
      expect(screen.getByText('INV-2026-0002')).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(invoicesApi.send).toHaveBeenCalledWith('inv-2');
    });
  });

  it('opens invoice detail modal on view click and displays line items', async () => {
    renderBillingPage(mockAdminUser);

    await waitFor(() => {
      expect(screen.getByText('INV-2026-0001')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(invoicesApi.get).toHaveBeenCalledWith('inv-1');
      expect(screen.getByText('Invoice INV-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('Monthly GST Retainer')).toBeInTheDocument();
    });
  });

  it('opens payment allocations modal when clicking allocations button', async () => {
    renderBillingPage(mockAdminUser);

    const paymentsTabBtn = screen.getByRole('button', { name: /Payments/i });
    fireEvent.click(paymentsTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Allocations \(1\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Allocations \(1\)/i));

    await waitFor(() => {
      expect(paymentsApi.getAllocations).toHaveBeenCalledWith('pmt-1');
      expect(screen.getByText('Payment Allocations — ₹5,000.00')).toBeInTheDocument();
    });
  });
});
