import { apiClient } from './client';
import type {
  DashboardSummary,
  DashboardWorkQueueResponse,
  UpcomingDeadlinesResponse,
  StaffWorkloadItem,
  QueueCategory,
} from '../types/dashboard';

export const dashboardApi = {
  getSummary: (): Promise<DashboardSummary> => {
    return apiClient<DashboardSummary>('/dashboard/summary/');
  },

  getWorkQueue: (params: {
    queue_type?: QueueCategory;
    assigned_to_me?: boolean;
    limit?: number;
  } = {}): Promise<DashboardWorkQueueResponse> => {
    return apiClient<DashboardWorkQueueResponse>('/dashboard/work-queue/', {
      params: {
        queue_type: params.queue_type === 'all' ? undefined : params.queue_type,
        assigned_to_me: params.assigned_to_me ? 'true' : undefined,
        limit: params.limit ?? 50,
      },
    });
  },

  getUpcomingDeadlines: (params: {
    days?: number;
    assigned_to_me?: boolean;
  } = {}): Promise<UpcomingDeadlinesResponse> => {
    return apiClient<UpcomingDeadlinesResponse>('/dashboard/upcoming-deadlines/', {
      params: {
        days: params.days ?? 7,
        assigned_to_me: params.assigned_to_me ? 'true' : undefined,
      },
    });
  },

  getStaffWorkload: (): Promise<StaffWorkloadItem[]> => {
    return apiClient<StaffWorkloadItem[]>('/dashboard/staff-workload/');
  },
};
