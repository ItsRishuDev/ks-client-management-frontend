import { apiClient } from './client';
import type {
  CreateTaskPayload,
  Task,
  TaskListParams,
  TaskListResponse,
  UpdateTaskPayload,
} from '../types/task';

export type { TaskListParams };

export const tasksApi = {
  list: async (params?: TaskListParams): Promise<TaskListResponse> => {
    return apiClient<TaskListResponse>('/tasks/', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  get: async (taskId: string): Promise<Task> => {
    return apiClient<Task>(`/tasks/${taskId}/`, {
      method: 'GET',
    });
  },

  create: async (payload: CreateTaskPayload): Promise<Task> => {
    return apiClient<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: async (taskId: string, payload: UpdateTaskPayload): Promise<Task> => {
    return apiClient<Task>(`/tasks/${taskId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  complete: async (taskId: string): Promise<Task> => {
    return apiClient<Task>(`/tasks/${taskId}/complete/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  cancel: async (taskId: string): Promise<Task> => {
    return apiClient<Task>(`/tasks/${taskId}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};
