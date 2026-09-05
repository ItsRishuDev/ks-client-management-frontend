import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DocumentsPage } from '../pages/DocumentsPage';
import { AuthContext } from '../context/authContextDef';
import { documentsApi } from '../api/documents';
import { clientsApi } from '../api/clients';
import { ToastProvider } from '../components/ui/Toast';
import type { User } from '../types/auth';
import type {
  Document,
  DocumentListResponse,
  DocumentRequisition,
  RequisitionListResponse,
} from '../types/document';
import type { ClientListResponse, GSTRegistration } from '../types/client';

const mockAdminUser: User = {
  id: 'usr-admin-1',
  name: 'CA Suresh Raina',
  email: 'suresh@apex.com',
  role: 'ADMIN',
  permissions: [
    'documents.view',
    'documents.upload',
    'documents.review',
    'clients.view',
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
  permissions: ['documents.view', 'documents.upload', 'clients.view'],
  firm: {
    id: 'firm-1',
    legal_name: 'Apex Advisory',
    display_name: 'Apex Advisory',
  },
  is_active: true,
};

const mockRequisitions: DocumentRequisition[] = [
  {
    id: 'req-1',
    firm: 'firm-1',
    client: 'client-1',
    client_name: 'Acme Industries',
    client_code: 'CL-001',
    entity: 'ent-1',
    gst_registration: 'gst-1',
    gstin: '27AAAAA0000A1Z5',
    compliance: 'comp-1',
    compliance_label: 'GSTR_3B (August 2026)',
    document_type: 'SALES_REGISTER',
    description: 'August 2026 sales invoice spreadsheet',
    due_date: '2026-09-15',
    priority: 'HIGH',
    status: 'REQUESTED',
    assigned_user: 'usr-staff-1',
    assigned_user_name: 'Neha Sharma',
    received_date: null,
    notes: 'Urgent for return preparation',
    fulfilled_documents_count: 0,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'req-2',
    firm: 'firm-1',
    client: 'client-2',
    client_name: 'Bharat Traders',
    client_code: 'CL-002',
    entity: 'ent-2',
    gst_registration: 'gst-2',
    gstin: '23BBBBB0000B1Z6',
    compliance: null,
    compliance_label: '',
    document_type: 'BANK_STATEMENT',
    description: 'Q2 Current Account Statement',
    due_date: '2026-09-10',
    priority: 'MEDIUM',
    status: 'RECEIVED',
    assigned_user: 'usr-admin-1',
    assigned_user_name: 'CA Suresh Raina',
    received_date: '2026-09-04',
    notes: 'Received via email',
    fulfilled_documents_count: 1,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-04T10:00:00Z',
  },
];

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    firm: 'firm-1',
    client: 'client-1',
    client_name: 'Acme Industries',
    client_code: 'CL-001',
    entity: 'ent-1',
    gst_registration: 'gst-1',
    gstin: '27AAAAA0000A1Z5',
    compliance: 'comp-1',
    compliance_label: 'GSTR_3B (August 2026)',
    document_requisition: 'req-1',
    requisition_description: 'August 2026 sales invoice spreadsheet',
    document_type: 'SALES_REGISTER',
    file_name: 'sales_aug2026.xlsx',
    storage_key: 'firms/firm-1/clients/client-1/sales_aug2026.xlsx',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    file_size: 1048576,
    uploaded_by: 'usr-staff-1',
    uploaded_by_name: 'Neha Sharma',
    uploaded_at: '2026-09-04T12:00:00Z',
    review_status: 'PENDING',
    reviewed_by: null,
    reviewed_by_name: '',
    reviewed_at: null,
    review_notes: '',
    metadata: {},
    created_at: '2026-09-04T12:00:00Z',
    updated_at: '2026-09-04T12:00:00Z',
  },
  {
    id: 'doc-2',
    firm: 'firm-1',
    client: 'client-2',
    client_name: 'Bharat Traders',
    client_code: 'CL-002',
    entity: 'ent-2',
    gst_registration: 'gst-2',
    gstin: '23BBBBB0000B1Z6',
    compliance: null,
    compliance_label: '',
    document_requisition: 'req-2',
    requisition_description: 'Q2 Current Account Statement',
    document_type: 'BANK_STATEMENT',
    file_name: 'hdfc_bank_q2.pdf',
    storage_key: 'firms/firm-1/clients/client-2/hdfc_bank_q2.pdf',
    mime_type: 'application/pdf',
    file_size: 524288,
    uploaded_by: 'usr-admin-1',
    uploaded_by_name: 'CA Suresh Raina',
    uploaded_at: '2026-09-03T10:00:00Z',
    review_status: 'ACCEPTED',
    reviewed_by: 'usr-admin-1',
    reviewed_by_name: 'CA Suresh Raina',
    reviewed_at: '2026-09-03T11:00:00Z',
    review_notes: 'Verified bank balances against tally entries.',
    metadata: {},
    created_at: '2026-09-03T10:00:00Z',
    updated_at: '2026-09-03T11:00:00Z',
  },
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

const mockGSTRegistrations: GSTRegistration[] = [
  {
    id: 'gst-1',
    client: 'client-1',
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
];

const mockRequisitionListResponse: RequisitionListResponse = {
  items: mockRequisitions,
  page: 1,
  page_size: 10,
  total: 2,
};

const mockDocumentListResponse: DocumentListResponse = {
  items: mockDocuments,
  page: 1,
  page_size: 10,
  total: 2,
};

const renderWithProviders = (
  initialEntries = ['/documents'],
  currentUser: User = mockAdminUser
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
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
              <Route path="/documents" element={<DocumentsPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('Documents + Document Requisitions Vertical Slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(documentsApi, 'listRequisitions').mockResolvedValue(mockRequisitionListResponse);
    vi.spyOn(documentsApi, 'getRequisition').mockImplementation(async (id: string) => {
      const found = mockRequisitions.find((r) => r.id === id);
      if (!found) throw new Error('Not found');
      return found;
    });
    vi.spyOn(documentsApi, 'createRequisition').mockImplementation(async (payload) => ({
      id: 'req-new',
      firm: 'firm-1',
      client: payload.client_id,
      client_name: 'Acme Industries',
      client_code: 'CL-001',
      document_type: payload.document_type,
      description: payload.description || '',
      due_date: payload.due_date || null,
      priority: payload.priority || 'MEDIUM',
      status: 'REQUESTED',
      assigned_user: null,
      assigned_user_name: '',
      received_date: null,
      notes: payload.notes || '',
      created_at: '2026-09-05T12:00:00Z',
      updated_at: '2026-09-05T12:00:00Z',
    }));
    vi.spyOn(documentsApi, 'updateRequisition').mockImplementation(async (id, payload) => {
      const found = mockRequisitions.find((r) => r.id === id);
      return {
        ...(found || mockRequisitions[0]),
        ...payload,
        status: payload.status || found?.status || 'REQUESTED',
        priority: payload.priority || found?.priority || 'MEDIUM',
      };
    });
    vi.spyOn(documentsApi, 'expireRequisition').mockImplementation(async (id) => {
      const found = mockRequisitions.find((r) => r.id === id);
      return {
        ...(found || mockRequisitions[0]),
        status: 'EXPIRED',
      };
    });

    vi.spyOn(documentsApi, 'listDocuments').mockResolvedValue(mockDocumentListResponse);
    vi.spyOn(documentsApi, 'getDocument').mockImplementation(async (id: string) => {
      const found = mockDocuments.find((d) => d.id === id);
      if (!found) throw new Error('Not found');
      return found;
    });
    vi.spyOn(documentsApi, 'requestUpload').mockResolvedValue({
      document_id: 'doc-new',
      upload_url: 'https://storage.local/upload',
      storage_key: 'firms/firm-1/clients/client-1/test.pdf',
      expires_at: '2026-09-05T15:00:00Z',
    });
    vi.spyOn(documentsApi, 'completeUpload').mockResolvedValue({
      id: 'doc-new',
      firm: 'firm-1',
      client: 'client-1',
      client_name: 'Acme Industries',
      client_code: 'CL-001',
      document_type: 'SALES_REGISTER',
      file_name: 'test.pdf',
      storage_key: 'firms/firm-1/clients/client-1/test.pdf',
      mime_type: 'application/pdf',
      file_size: 1024,
      uploaded_by: 'usr-admin-1',
      uploaded_by_name: 'CA Suresh Raina',
      uploaded_at: '2026-09-05T12:00:00Z',
      review_status: 'PENDING',
      reviewed_by: null,
      reviewed_by_name: '',
      reviewed_at: null,
      review_notes: '',
      created_at: '2026-09-05T12:00:00Z',
      updated_at: '2026-09-05T12:00:00Z',
    });
    vi.spyOn(documentsApi, 'downloadDocument').mockResolvedValue({
      document_id: 'doc-1',
      file_name: 'sales_aug2026.xlsx',
      download_url: 'https://storage.local/download/sales_aug2026.xlsx',
    });
    vi.spyOn(documentsApi, 'reviewDocument').mockImplementation(async (id, payload) => {
      const found = mockDocuments.find((d) => d.id === id);
      return {
        ...(found || mockDocuments[0]),
        review_status: payload.status,
        review_notes: payload.notes || '',
        reviewed_by: 'usr-admin-1',
        reviewed_by_name: 'CA Suresh Raina',
        reviewed_at: '2026-09-05T12:00:00Z',
      };
    });

    vi.spyOn(clientsApi, 'list').mockResolvedValue(mockClientsList);
    vi.spyOn(clientsApi, 'listGSTRegistrations').mockResolvedValue(mockGSTRegistrations);
  });

  it('1. Renders documents header, statistics cards, and requisitions table by default', async () => {
    renderWithProviders();

    expect(await screen.findByText('Documents & Requisitions')).toBeInTheDocument();
    expect(screen.getByText('Open Requisitions')).toBeInTheDocument();
    expect(screen.getByText('Pending Verification')).toBeInTheDocument();
    expect(screen.getByText('Verified Documents')).toBeInTheDocument();

    // Verify Requisition tab items
    expect(await screen.findByText('August 2026 sales invoice spreadsheet')).toBeInTheDocument();
    expect(screen.getByText('Q2 Current Account Statement')).toBeInTheDocument();
    expect(screen.getByText('Acme Industries')).toBeInTheDocument();
    expect(screen.getByText('Bharat Traders')).toBeInTheDocument();
  });

  it('2. Switches to Uploaded Documents tab and lists stored files', async () => {
    renderWithProviders();

    await screen.findByText('Documents & Requisitions');

    const documentsTab = screen.getByRole('tab', { name: /Uploaded Documents/i });
    fireEvent.click(documentsTab);

    // Verify Document tab items
    expect(await screen.findByText('sales_aug2026.xlsx')).toBeInTheDocument();
    expect(screen.getByText('hdfc_bank_q2.pdf')).toBeInTheDocument();
    expect(screen.getAllByText('Pending Review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Accepted').length).toBeGreaterThanOrEqual(1);
  });

  it('3. Filters requisitions by priority and search term', async () => {
    renderWithProviders();

    await screen.findByText('Documents & Requisitions');

    const searchInput = screen.getByPlaceholderText(/Search by client, GSTIN, description/i);
    fireEvent.change(searchInput, { target: { value: 'August sales' } });

    await waitFor(() => {
      expect(documentsApi.listRequisitions).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'August sales' })
      );
    });
  });

  it('4. Filters uploaded documents by review status', async () => {
    renderWithProviders(['/documents?tab=documents']);

    await screen.findByText('Documents & Requisitions');

    const reviewPill = screen.getByRole('button', { name: 'Pending Review' });
    fireEvent.click(reviewPill);

    await waitFor(() => {
      expect(documentsApi.listDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ review_status: 'PENDING' })
      );
    });
  });

  it('5. Renders empty state when requisitions query returns no items', async () => {
    vi.spyOn(documentsApi, 'listRequisitions').mockResolvedValueOnce({
      items: [],
      page: 1,
      page_size: 10,
      total: 0,
    });

    renderWithProviders();

    expect(await screen.findByText('No document requisitions found')).toBeInTheDocument();
  });

  it('6. Opens Request Document modal and creates a requisition', async () => {
    renderWithProviders();

    await screen.findByText('Documents & Requisitions');

    const reqBtn = screen.getByRole('button', { name: /\+ Request Document/i });
    fireEvent.click(reqBtn);

    expect(await screen.findByText('Request Document from Client')).toBeInTheDocument();

    const clientSelect = await screen.findByLabelText(/Client \*/i);
    fireEvent.change(clientSelect, { target: { value: 'client-1' } });

    const submitBtn = screen.getByRole('button', { name: /Create Requisition/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(documentsApi.createRequisition).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'client-1',
          document_type: 'SALES_REGISTER',
        })
      );
    });
  });

  it('7. Opens Upload Document modal and uploads a file', async () => {
    renderWithProviders();

    await screen.findByText('Documents & Requisitions');

    const uploadBtn = screen.getByRole('button', { name: /\+ Upload Document/i });
    fireEvent.click(uploadBtn);

    expect(await screen.findByText('Upload Document')).toBeInTheDocument();

    const clientSelect = await screen.findByLabelText(/Client \*/i);
    fireEvent.change(clientSelect, { target: { value: 'client-1' } });

    const file = new File(['mock content'], 'test_upload.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitUploadBtn = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(submitUploadBtn);

    await waitFor(() => {
      expect(documentsApi.requestUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'client-1',
          file_name: 'test_upload.pdf',
        })
      );
      expect(documentsApi.completeUpload).toHaveBeenCalledWith('doc-new');
    });
  });

  it('8. Opens Document Review modal and verifies a document as ACCEPTED', async () => {
    renderWithProviders(['/documents?tab=documents']);

    await screen.findByText('Documents & Requisitions');

    const reviewButtons = await screen.findAllByTitle('Review document');
    fireEvent.click(reviewButtons[0]);

    expect(await screen.findByText('Review Client Document')).toBeInTheDocument();

    const submitReviewBtn = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitReviewBtn);

    await waitFor(() => {
      expect(documentsApi.reviewDocument).toHaveBeenCalledWith(
        'doc-1',
        expect.objectContaining({
          status: 'ACCEPTED',
        })
      );
    });
  });

  it('9. Generates download link when clicking Download button', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderWithProviders(['/documents?tab=documents']);

    await screen.findByText('Documents & Requisitions');

    const downloadButtons = await screen.findAllByTitle('Download document');
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(documentsApi.downloadDocument).toHaveBeenCalledWith('doc-1');
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://storage.local/download/sales_aug2026.xlsx',
        '_blank'
      );
    });

    windowOpenSpy.mockRestore();
  });

  it('10. Hides document Review button for Staff users without documents.review permission', async () => {
    renderWithProviders(['/documents?tab=documents'], mockStaffUser);

    await screen.findByText('Documents & Requisitions');

    // Staff user can download, but cannot see review action button
    expect(await screen.findByText('sales_aug2026.xlsx')).toBeInTheDocument();
    expect(screen.queryByTitle('Review document')).not.toBeInTheDocument();
  });
});
