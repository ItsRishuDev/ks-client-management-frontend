import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TasksPage } from '../pages/TasksPage';
import { AuthContext } from '../context/authContextDef';
import { ToastProvider } from '../components/ui/Toast';
import { tasksApi } from '../api/tasks';
import { clientsApi, usersApi } from '../api/clients';
import type { User } from '../types/auth';
import type { TaskListResponse } from '../types/task';
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
  permissions: [
    'tasks.view',
    'tasks.create',
    'tasks.assign',
    'tasks.complete',
    'clients.view',
  ],
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
  permissions: ['tasks.view', 'tasks.create', 'tasks.complete', 'clients.view'],
};

const mockTasksList: TaskListResponse = {
  items: [
    {
      id: 'task-1',
      firm: 'firm-1',
      client: 'client-1',
      client_name: 'Acme Industries',
      client_code: 'CL-001',
      entity: 'ent-1',
      entity_name: 'Acme Unit 1',
      gst_registration: 'gst-1',
      gstin: '29ABCDE1234F1Z5',
      compliance: 'comp-1',
      compliance_label: 'GSTR_3B (August 2026)',
      document_requisition: 'req-1',
      requisition_label: 'Sales Register',
      invoice_id: null,
      title: 'Verify August 2B Invoices',
      description: 'Reconcile purchase register with GSTR-2B before filing.',
      assigned_user: 'usr-admin-1',
      assigned_user_name: 'CA Suresh Raina',
      created_by: 'usr-admin-1',
      created_by_name: 'CA Suresh Raina',
      due_date: '2026-09-15',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      completed_at: null,
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-02T10:00:00Z',
    },
    {
      id: 'task-2',
      firm: 'firm-1',
      client: 'client-2',
      client_name: 'Bharat Traders',
      client_code: 'CL-002',
      entity: null,
      gst_registration: null,
      compliance: null,
      document_requisition: null,
      invoice_id: null,
      title: 'Follow up on missing bank statement',
      description: 'Client did not send ICICI statement for Q1.',
      assigned_user: 'usr-staff-1',
      assigned_user_name: 'Neha Sharma',
      created_by: 'usr-admin-1',
      created_by_name: 'CA Suresh Raina',
      due_date: '2026-08-10', // Overdue
      priority: 'URGENT',
      status: 'TO_DO',
      completed_at: null,
      created_at: '2026-08-01T10:00:00Z',
      updated_at: '2026-08-01T10:00:00Z',
    },
    {
      id: 'task-3',
      firm: 'firm-1',
      client: null,
      entity: null,
      gst_registration: null,
      compliance: null,
      document_requisition: null,
      invoice_id: null,
      title: 'Renew office digital signature',
      description: 'DSC expires next week.',
      assigned_user: null,
      assigned_user_name: '',
      created_by: 'usr-admin-1',
      created_by_name: 'CA Suresh Raina',
      due_date: '2026-09-30',
      priority: 'LOW',
      status: 'COMPLETED',
      completed_at: '2026-09-04T12:00:00Z',
      created_at: '2026-08-15T10:00:00Z',
      updated_at: '2026-09-04T12:00:00Z',
    },
  ],
  page: 1,
  page_size: 15,
  total: 3,
};

const mockFirmUsers = [
  { id: 'usr-admin-1', name: 'CA Suresh Raina', email: 'suresh@apex.com', role: 'ADMIN' },
  { id: 'usr-staff-1', name: 'Neha Sharma', email: 'neha@apex.com', role: 'STAFF' },
];

const mockClientsList = {
  items: [
    {
      id: 'client-1',
      client_code: 'CL-001',
      legal_name: 'Acme Industries Private Limited',
      display_name: 'Acme Industries',
      client_type: 'PRIVATE_LIMITED',
    },
  ],
  page: 1,
  page_size: 15,
  total: 1,
};

function renderTasksPage(currentUser: User = mockAdminUser) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider
          value={{
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
            clearError: vi.fn(),
          }}
        >
          <MemoryRouter>
            <TasksPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('Tasks Module Vertical Slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(tasksApi, 'list').mockResolvedValue(mockTasksList);
    vi.spyOn(usersApi, 'list').mockResolvedValue(mockFirmUsers);
    vi.spyOn(clientsApi, 'list').mockResolvedValue(mockClientsList as unknown as ClientListResponse);
  });

  it('1. Renders Tasks workspace with KPI cards, quick tabs, and tasks table', async () => {
    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('Tasks & Work Management')).toBeInTheDocument();
      expect(screen.getByText('Verify August 2B Invoices')).toBeInTheDocument();
      expect(screen.getByText('Follow up on missing bank statement')).toBeInTheDocument();
      expect(screen.getByText('Renew office digital signature')).toBeInTheDocument();
    });

    // Check KPI Cards
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('My Open Tasks')).toBeInTheDocument();
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getByText('Overdue Tasks')).toBeInTheDocument();

    // Check Badges & context
    expect(screen.getByText('(CL-001)')).toBeInTheDocument();
    expect(screen.getByText('(CL-002)')).toBeInTheDocument();
  });

  it('2. Switches quick tabs to filter tasks by status (e.g. In Progress, Completed)', async () => {
    const listSpy = vi.spyOn(tasksApi, 'list').mockResolvedValue(mockTasksList);
    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('Verify August 2B Invoices')).toBeInTheDocument();
    });

    const inProgressTab = screen.getByRole('button', { name: /in progress/i });
    fireEvent.click(inProgressTab);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'IN_PROGRESS' })
      );
    });
  });

  it('3. Searches tasks by query string', async () => {
    const listSpy = vi.spyOn(tasksApi, 'list').mockResolvedValue(mockTasksList);
    renderTasksPage();

    const searchInput = screen.getByPlaceholderText(/search by title, description, client, or gstin/i);
    fireEvent.change(searchInput, { target: { value: 'August' } });

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'August' })
      );
    });
  });

  it('4. Renders empty state when no tasks match filters', async () => {
    vi.spyOn(tasksApi, 'list').mockResolvedValue({
      items: [],
      page: 1,
      page_size: 15,
      total: 0,
    });

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('No Tasks Found')).toBeInTheDocument();
    });
  });

  it('5. Opens Create Task modal, fills fields, and submits creation mutation', async () => {
    const createSpy = vi.spyOn(tasksApi, 'create').mockResolvedValue(mockTasksList.items[0]);
    renderTasksPage();

    const createBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(createBtn);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Create New Task')).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText(/task title \*/i), {
      target: { value: 'File Form 10BD' },
    });
    fireEvent.change(within(dialog).getByLabelText(/description/i), {
      target: { value: 'Annual donation statement filing' },
    });

    const submitBtn = within(dialog).getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'File Form 10BD',
          description: 'Annual donation statement filing',
        })
      );
    });
  });

  it('6. Completes a task directly from the Done action button', async () => {
    const completeSpy = vi.spyOn(tasksApi, 'complete').mockResolvedValue({
      ...mockTasksList.items[0],
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    });

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('Verify August 2B Invoices')).toBeInTheDocument();
    });

    const doneButtons = screen.getAllByRole('button', { name: /done/i });
    fireEvent.click(doneButtons[0]);

    await waitFor(() => {
      expect(completeSpy).toHaveBeenCalledWith('task-1');
    });
  });

  it('7. Opens Task Detail modal on row click with timeline and context', async () => {
    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('Verify August 2B Invoices')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByTitle('View details');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Task ID: task-1')).toBeInTheDocument();
      expect(within(dialog).getByText(/Reconcile purchase register with GSTR-2B before filing/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/GSTR_3B \(August 2026\)/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/Sales Register/i)).toBeInTheDocument();
    });
  });

  it('8. Opens Edit Task modal and submits status/priority updates', async () => {
    const updateSpy = vi.spyOn(tasksApi, 'update').mockResolvedValue({
      ...mockTasksList.items[0],
      status: 'WAITING',
    });

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('Verify August 2B Invoices')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit task');
    fireEvent.click(editButtons[0]);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Edit Task')).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText(/status/i), {
      target: { value: 'WAITING' },
    });

    const saveBtn = within(dialog).getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({ status: 'WAITING' })
      );
    });
  });

  it('9. Hides assignee dropdown for Staff users without tasks.assign permission', async () => {
    renderTasksPage(mockStaffUser);

    const createBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(createBtn);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Create New Task')).toBeInTheDocument();
    expect(within(dialog).getByText(/self-assigned/i)).toBeInTheDocument();
    expect(within(dialog).queryByLabelText(/assignee/i)).not.toBeInTheDocument();
  });
});
