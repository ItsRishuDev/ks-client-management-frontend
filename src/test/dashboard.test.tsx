import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../pages/DashboardPage';
import { AuthContext } from '../context/authContextDef';
import { dashboardApi } from '../api/dashboard';
import type { User } from '../types/auth';
import type {
  DashboardSummary,
  DashboardWorkQueueResponse,
  UpcomingDeadlinesResponse,
  StaffWorkloadItem,
} from '../types/dashboard';

const mockAdminUser: User = {
  id: 'user-admin-uuid',
  name: 'CA Ramesh Sharma',
  email: 'ramesh@apex.com',
  role: 'ADMIN',
  firm: {
    id: 'firm-apex-uuid',
    legal_name: 'Apex CA Firm',
    display_name: 'Apex CA Firm',
  },
  is_active: true,
};

const mockStaffUser: User = {
  id: 'user-staff-uuid',
  name: 'Pooja Verma',
  email: 'pooja@apex.com',
  role: 'STAFF',
  firm: {
    id: 'firm-apex-uuid',
    legal_name: 'Apex CA Firm',
    display_name: 'Apex CA Firm',
  },
  is_active: true,
};

const mockSummary: DashboardSummary = {
  total_clients: 12,
  due_today: 3,
  overdue_compliance: 2,
  documents_pending: 5,
  tasks_due_today: 4,
  outstanding_invoices: '45000.00',
};

const mockWorkQueue: DashboardWorkQueueResponse = {
  compliance: [
    {
      id: 'comp-1',
      type: 'compliance',
      client_id: 'client-1',
      client_name: 'Tata Consultancy Services',
      gstin: '27AABC1234F1Z1',
      return_type: 'GSTR-3B',
      financial_year: '2026-27',
      tax_period: 'August 2026',
      due_date: '2026-09-20',
      status: 'READY_TO_FILE',
      priority: 'HIGH',
      assigned_user_id: 'user-staff-uuid',
      assigned_user_name: 'Pooja Verma',
      is_overdue: false,
    },
    {
      id: 'comp-2',
      type: 'compliance',
      client_id: 'client-2',
      client_name: 'Infosys BPM',
      gstin: '27AABC9999F1Z2',
      return_type: 'GSTR-1',
      financial_year: '2026-27',
      tax_period: 'August 2026',
      due_date: '2026-09-01',
      status: 'DOCUMENTS_PENDING',
      priority: 'URGENT',
      assigned_user_id: 'user-staff-uuid',
      assigned_user_name: 'Pooja Verma',
      is_overdue: true,
    },
  ],
  tasks: [
    {
      id: 'task-1',
      type: 'task',
      title: 'Verify Input Tax Credit 2B Mismatch',
      client_id: 'client-1',
      client_name: 'Tata Consultancy Services',
      due_date: '2026-09-05',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigned_user_id: 'user-admin-uuid',
      assigned_user_name: 'CA Ramesh Sharma',
      is_overdue: false,
    },
  ],
  documents: [
    {
      id: 'doc-1',
      type: 'document',
      document_type: 'Bank Statement Q1',
      description: 'HDFC Current Account Statement',
      client_id: 'client-1',
      client_name: 'Tata Consultancy Services',
      due_date: '2026-09-10',
      status: 'REQUESTED',
      priority: 'MEDIUM',
      assigned_user_id: 'user-staff-uuid',
      assigned_user_name: 'Pooja Verma',
      is_overdue: false,
    },
  ],
  receivables: [
    {
      id: 'inv-1',
      type: 'receivable',
      invoice_number: 'INV-2026-089',
      client_id: 'client-1',
      client_name: 'Tata Consultancy Services',
      total_amount: '25000.00',
      outstanding_balance: '15000.00',
      due_date: '2026-09-15',
      status: 'PARTIALLY_PAID',
      is_overdue: false,
    },
  ],
};

const mockUpcomingDeadlines: UpcomingDeadlinesResponse = {
  range_days: 7,
  from_date: '2026-09-05',
  to_date: '2026-09-12',
  compliance: [
    {
      id: 'comp-1',
      client_name: 'Tata Consultancy Services',
      gstin: '27AABC1234F1Z1',
      return_type: 'GSTR-3B',
      tax_period: 'August 2026',
      due_date: '2026-09-20',
      status: 'READY_TO_FILE',
      priority: 'HIGH',
      assigned_user_name: 'Pooja Verma',
    },
  ],
  documents: [
    {
      id: 'doc-1',
      client_name: 'Tata Consultancy Services',
      document_type: 'Bank Statement Q1',
      due_date: '2026-09-10',
      status: 'REQUESTED',
      priority: 'MEDIUM',
      assigned_user_name: 'Pooja Verma',
    },
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Verify Input Tax Credit 2B Mismatch',
      client_name: 'Tata Consultancy Services',
      due_date: '2026-09-05',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigned_user_name: 'CA Ramesh Sharma',
    },
  ],
};

const mockStaffWorkload: StaffWorkloadItem[] = [
  {
    user_id: 'user-staff-uuid',
    user_name: 'Pooja Verma',
    email: 'pooja@apex.com',
    role: 'STAFF',
    active_tasks: 4,
    overdue_tasks: 1,
    assigned_compliance: 8,
    pending_documents: 3,
    total_workload: 15,
  },
  {
    user_id: 'user-admin-uuid',
    user_name: 'CA Ramesh Sharma',
    email: 'ramesh@apex.com',
    role: 'ADMIN',
    active_tasks: 2,
    overdue_tasks: 0,
    assigned_compliance: 2,
    pending_documents: 1,
    total_workload: 5,
  },
];

describe('Dashboard Vertical Slice', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderDashboard = (user: User = mockAdminUser) => {
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
          <MemoryRouter>
            <DashboardPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renders all metrics and operational queues from backend data', async () => {
    vi.spyOn(dashboardApi, 'getSummary').mockResolvedValue(mockSummary);
    vi.spyOn(dashboardApi, 'getWorkQueue').mockResolvedValue(mockWorkQueue);
    vi.spyOn(dashboardApi, 'getUpcomingDeadlines').mockResolvedValue(mockUpcomingDeadlines);
    vi.spyOn(dashboardApi, 'getStaffWorkload').mockResolvedValue(mockStaffWorkload);

    renderDashboard(mockAdminUser);

    // Header rendered
    expect(screen.getByText(/practice operations dashboard/i)).toBeInTheDocument();
    expect(screen.getByText('Apex CA Firm')).toBeInTheDocument();

    // Summary Metrics
    await waitFor(() => {
      expect(screen.getByText('Overdue Compliance')).toBeInTheDocument();
      expect(screen.getByText('Due Today')).toBeInTheDocument();
    });

    screen.debug(undefined, 30000);

    // Check Work Queue table items
    await waitFor(() => {
      expect(screen.getAllByText(/GSTR-3B/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/GSTR-1/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Verify Input Tax Credit 2B Mismatch/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Bank Statement Q1/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/INV-2026-089/i)).toBeInTheDocument();
    });

    // Check Staff Workload
    expect(screen.getByText(/Team Workload Distribution/i)).toBeInTheDocument();
    expect(screen.getAllByText('Pooja Verma').length).toBeGreaterThan(0);
    expect(screen.getByText((_, el) => el?.textContent?.trim() === '15 active items')).toBeInTheDocument();
  });

  it('filters work queue by category tabs', async () => {
    vi.spyOn(dashboardApi, 'getSummary').mockResolvedValue(mockSummary);
    vi.spyOn(dashboardApi, 'getWorkQueue').mockResolvedValue(mockWorkQueue);
    vi.spyOn(dashboardApi, 'getUpcomingDeadlines').mockResolvedValue(mockUpcomingDeadlines);
    vi.spyOn(dashboardApi, 'getStaffWorkload').mockResolvedValue(mockStaffWorkload);

    renderDashboard(mockAdminUser);

    await waitFor(() => {
      expect(screen.getAllByText(/GSTR-3B/i).length).toBeGreaterThan(0);
    });

    // Switch to Tasks Tab
    const tasksTab = screen.getByRole('button', { name: /tasks 1/i });
    fireEvent.click(tasksTab);

    await waitFor(() => {
      expect(screen.getAllByText(/Verify Input Tax Credit 2B Mismatch/i).length).toBeGreaterThan(0);
    });
  });

  it('toggles "Assigned to Me" mode', async () => {
    vi.spyOn(dashboardApi, 'getSummary').mockResolvedValue(mockSummary);
    const getWorkQueueSpy = vi.spyOn(dashboardApi, 'getWorkQueue').mockResolvedValue(mockWorkQueue);
    vi.spyOn(dashboardApi, 'getUpcomingDeadlines').mockResolvedValue(mockUpcomingDeadlines);
    vi.spyOn(dashboardApi, 'getStaffWorkload').mockResolvedValue(mockStaffWorkload);

    renderDashboard(mockStaffUser);

    const toggleButton = screen.getByRole('button', { name: /all firm work/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /my assigned work/i })).toBeInTheDocument();
      expect(getWorkQueueSpy).toHaveBeenCalledWith(
        expect.objectContaining({ assigned_to_me: true })
      );
    });
  });

  it('hides staff workload section for Staff role', async () => {
    vi.spyOn(dashboardApi, 'getSummary').mockResolvedValue(mockSummary);
    vi.spyOn(dashboardApi, 'getWorkQueue').mockResolvedValue(mockWorkQueue);
    vi.spyOn(dashboardApi, 'getUpcomingDeadlines').mockResolvedValue(mockUpcomingDeadlines);
    const getWorkloadSpy = vi.spyOn(dashboardApi, 'getStaffWorkload').mockResolvedValue(mockStaffWorkload);

    renderDashboard(mockStaffUser);

    await waitFor(() => {
      expect(screen.getByText('Practice Operations Dashboard')).toBeInTheDocument();
    });

    expect(screen.queryByText('Team Workload Distribution')).not.toBeInTheDocument();
    expect(getWorkloadSpy).not.toHaveBeenCalled();
  });

  it('renders error state on API failure and handles retry', async () => {
    const getSummarySpy = vi.spyOn(dashboardApi, 'getSummary').mockRejectedValue(new Error('Network Error'));
    vi.spyOn(dashboardApi, 'getWorkQueue').mockResolvedValue(mockWorkQueue);
    vi.spyOn(dashboardApi, 'getUpcomingDeadlines').mockResolvedValue(mockUpcomingDeadlines);
    vi.spyOn(dashboardApi, 'getStaffWorkload').mockResolvedValue(mockStaffWorkload);

    renderDashboard(mockAdminUser);

    await waitFor(() => {
      expect(screen.getByText(/unable to load practice dashboard/i)).toBeInTheDocument();
    });

    // Mock recovery on retry
    getSummarySpy.mockResolvedValue(mockSummary);
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Overdue Compliance')).toBeInTheDocument();
    });
  });
});
