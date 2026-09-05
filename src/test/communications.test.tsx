import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunicationsPage } from '../pages/CommunicationsPage';
import { AuthContext } from '../context/authContextDef';
import { ToastProvider } from '../components/ui/Toast';
import { communicationsApi } from '../api/communications';
import { clientsApi } from '../api/clients';
import type { User } from '../types/auth';
import type {
  NotificationListResponse,
  TemplateListResponse,
} from '../types/communication';
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
  permissions: ['communications.view', 'communications.send', 'templates.manage', 'clients.view'],
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
  permissions: ['communications.view'],
};

const mockTemplatesList: TemplateListResponse = {
  items: [
    {
      id: 'tpl-1',
      firm: 'firm-1',
      name: 'GST 3B Reminder',
      channel: 'WHATSAPP',
      subject: '',
      body: 'Dear {{client_name}}, your GSTR-3B for {{period}} is due on {{due_date}}.',
      variables: ['client_name', 'period', 'due_date'],
      active: true,
      created_by: 'usr-admin-1',
      created_by_name: 'CA Suresh Raina',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z',
    },
    {
      id: 'tpl-2',
      firm: 'firm-1',
      name: 'Invoice Notice Email',
      channel: 'EMAIL',
      subject: 'Invoice for {{client_name}}',
      body: 'Please find attached invoice {{invoice_number}} of amount {{amount}}.',
      variables: ['client_name', 'invoice_number', 'amount'],
      active: true,
      created_by: 'usr-admin-1',
      created_by_name: 'CA Suresh Raina',
      created_at: '2026-09-02T10:00:00Z',
      updated_at: '2026-09-02T10:00:00Z',
    },
  ],
  page: 1,
  page_size: 20,
  total: 2,
};

const mockNotificationsList: NotificationListResponse = {
  items: [
    {
      id: 'notif-1',
      firm: 'firm-1',
      user: null,
      user_name: '',
      template: 'tpl-1',
      template_name: 'GST 3B Reminder',
      channel: 'WHATSAPP',
      status: 'SENT',
      subject: '',
      body: 'Dear Acme Industries, your GSTR-3B for August 2026 is due on 20-Sep-2026.',
      recipient_email: '',
      recipient_phone: '+919876543210',
      related_entity_type: 'CLIENT',
      related_entity_id: 'client-1',
      metadata: { whatsapp_url: 'https://wa.me/919876543210?text=Hello' },
      scheduled_at: null,
      sent_at: '2026-09-05T10:00:00Z',
      read_at: null,
      failure_reason: '',
      created_at: '2026-09-05T10:00:00Z',
      updated_at: '2026-09-05T10:00:00Z',
    },
    {
      id: 'notif-2',
      firm: 'firm-1',
      user: 'usr-staff-1',
      user_name: 'Neha Sharma',
      template: null,
      template_name: '',
      channel: 'IN_APP',
      status: 'DELIVERED',
      subject: 'Task Assigned',
      body: 'You have been assigned to prepare GSTR-1 for Acme.',
      recipient_email: '',
      recipient_phone: '',
      related_entity_type: 'TASK',
      related_entity_id: 'task-1',
      metadata: {},
      scheduled_at: null,
      sent_at: '2026-09-05T11:00:00Z',
      read_at: null,
      failure_reason: '',
      created_at: '2026-09-05T11:00:00Z',
      updated_at: '2026-09-05T11:00:00Z',
    },
  ],
  page: 1,
  page_size: 20,
  total: 2,
};

const mockClientsList: ClientListResponse = {
  items: [
    {
      id: 'client-1',
      client_code: 'CLI-001',
      client_type: 'PRIVATE_LIMITED',
      legal_name: 'Acme Industries Private Limited',
      display_name: 'Acme Industries',
      pan: 'ABCDE1234F',
      tan: '',
      primary_email: 'contact@acme.com',
      primary_phone: '+919876543210',
      address: 'Mumbai',
      primary_financial_year: '2026-2027',
      status: 'ACTIVE',
      notes: '',
      gstin_count: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ],
  page: 1,
  page_size: 100,
  total: 1,
};

describe('CommunicationsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.restoreAllMocks();
    vi.spyOn(communicationsApi, 'listNotifications').mockResolvedValue(mockNotificationsList);
    vi.spyOn(communicationsApi, 'listTemplates').mockResolvedValue(mockTemplatesList);
    vi.spyOn(clientsApi, 'list').mockResolvedValue(mockClientsList);
  });

  const renderComponent = (user: User = mockAdminUser) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthContext.Provider
            value={{
              user,
              isLoading: false,
              isAuthenticated: true,
              error: null,
              login: vi.fn(),
              logout: vi.fn(),
              refreshUser: vi.fn(),
              clearError: vi.fn(),
            }}
          >
            <ToastProvider>
              <CommunicationsPage />
            </ToastProvider>
          </AuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders summary KPIs and notifications log table', async () => {
    renderComponent();

    expect(screen.getByText('Communications & Reminders')).toBeInTheDocument();
    expect(screen.getByText('Total Communications')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp Reminders')).toBeInTheDocument();
    expect(screen.getByText('Email Dispatches')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('+919876543210')).toBeInTheDocument();
      expect(screen.getByText('Task Assigned')).toBeInTheDocument();
    });
  });

  it('switches between Communication Log and Message Templates tabs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Communication Log (2)')).toBeInTheDocument();
    });

    const templatesTabBtn = screen.getByRole('button', { name: /Message Templates/i });
    fireEvent.click(templatesTabBtn);

    await waitFor(() => {
      expect(screen.getByText('GST 3B Reminder')).toBeInTheDocument();
      expect(screen.getByText('Invoice Notice Email')).toBeInTheDocument();
    });
  });

  it('opens and submits create template modal', async () => {
    const createTemplateSpy = vi.spyOn(communicationsApi, 'createTemplate').mockResolvedValue({
      id: 'tpl-3',
      firm: 'firm-1',
      name: 'Payment Overdue WhatsApp',
      channel: 'WHATSAPP',
      subject: '',
      body: 'Dear {{client_name}}, invoice {{invoice_number}} of Rs {{amount}} is overdue.',
      variables: ['client_name', 'invoice_number', 'amount'],
      active: true,
      created_by: 'usr-admin-1',
      created_by_name: 'CA Suresh Raina',
      created_at: '2026-09-05T12:00:00Z',
      updated_at: '2026-09-05T12:00:00Z',
    });

    renderComponent();

    const newTemplateBtn = screen.getByRole('button', { name: /\+ New Template/i });
    fireEvent.click(newTemplateBtn);

    expect(screen.getByText('Create Notification Template')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Template Name \*/i);
    const bodyTextarea = screen.getByLabelText(/Message Body \*/i);

    fireEvent.change(nameInput, { target: { value: 'Payment Overdue WhatsApp' } });
    fireEvent.change(bodyTextarea, {
      target: { value: 'Dear {{client_name}}, invoice {{invoice_number}} of Rs {{amount}} is overdue.' },
    });

    expect(screen.getAllByText('{{client_name}}').length).toBeGreaterThan(0);
    expect(screen.getByText('{{invoice_number}}')).toBeInTheDocument();
    expect(screen.getAllByText('{{amount}}').length).toBeGreaterThan(0);

    const submitBtn = screen.getByRole('button', { name: /^Create Template$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createTemplateSpy).toHaveBeenCalledWith({
        name: 'Payment Overdue WhatsApp',
        channel: 'WHATSAPP',
        subject: '',
        body: 'Dear {{client_name}}, invoice {{invoice_number}} of Rs {{amount}} is overdue.',
        variables: ['client_name', 'invoice_number', 'amount'],
        active: true,
      });
    });
  });

  it('sends WhatsApp reminder and opens click-to-send URL', async () => {
    const sendSpy = vi.spyOn(communicationsApi, 'send').mockResolvedValue({
      notification: mockNotificationsList.items[0],
      whatsapp_url: 'https://wa.me/919876543210?text=Dear%20Acme',
    });
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderComponent();

    const sendBtn = screen.getByRole('button', { name: /Send Message \/ WhatsApp/i });
    fireEvent.click(sendBtn);

    expect(screen.getByText('Send Message / Reminder')).toBeInTheDocument();

    const phoneInput = screen.getByLabelText(/Recipient Phone Number/i);
    const bodyInput = screen.getByLabelText(/Message Body \*/i);

    fireEvent.change(phoneInput, { target: { value: '+919876543210' } });
    fireEvent.change(bodyInput, { target: { value: 'Hello Acme, your GST return is due.' } });

    const submitSendBtn = screen.getByRole('button', { name: /Generate & Send WhatsApp/i });
    fireEvent.click(submitSendBtn);

    await waitFor(() => {
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'WHATSAPP',
          recipient_phone: '+919876543210',
          body: 'Hello Acme, your GST return is due.',
        })
      );
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://wa.me/919876543210?text=Dear%20Acme',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  it('marks in-app notification as read', async () => {
    const markAsReadSpy = vi.spyOn(communicationsApi, 'markAsRead').mockResolvedValue({
      ...mockNotificationsList.items[1],
      status: 'READ',
      read_at: '2026-09-05T12:00:00Z',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Mark Read')).toBeInTheDocument();
    });

    const markReadBtn = screen.getByText('Mark Read');
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(markAsReadSpy).toHaveBeenCalledWith('notif-2');
    });
  });

  it('respects role-based permissions for staff', async () => {
    renderComponent(mockStaffUser);

    expect(screen.queryByRole('button', { name: /\+ New Template/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Send Message \/ WhatsApp/i })).not.toBeInTheDocument();
  });
});
