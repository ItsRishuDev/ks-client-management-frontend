import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../../api/dashboard';
import type { QueueCategory } from '../../../types/dashboard';

export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  summary: ['dashboard', 'summary'] as const,
  workQueue: (queueType?: QueueCategory, assignedToMe?: boolean) =>
    ['dashboard', 'workQueue', { queueType, assignedToMe }] as const,
  upcomingDeadlines: (days?: number, assignedToMe?: boolean) =>
    ['dashboard', 'upcomingDeadlines', { days, assignedToMe }] as const,
  staffWorkload: ['dashboard', 'staffWorkload'] as const,
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.summary,
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useDashboardWorkQueue = (params: {
  queue_type?: QueueCategory;
  assigned_to_me?: boolean;
  limit?: number;
} = {}) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.workQueue(params.queue_type, params.assigned_to_me),
    queryFn: () => dashboardApi.getWorkQueue(params),
    staleTime: 30 * 1000,
  });
};

export const useDashboardUpcomingDeadlines = (params: {
  days?: number;
  assigned_to_me?: boolean;
} = {}) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.upcomingDeadlines(params.days, params.assigned_to_me),
    queryFn: () => dashboardApi.getUpcomingDeadlines(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useDashboardStaffWorkload = (enabled: boolean = true) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.staffWorkload,
    queryFn: () => dashboardApi.getStaffWorkload(),
    enabled,
    staleTime: 60 * 1000,
  });
};
