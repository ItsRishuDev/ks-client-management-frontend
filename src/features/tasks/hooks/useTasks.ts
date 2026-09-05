import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../../api/tasks';
import type {
  CreateTaskPayload,
  Task,
  TaskListParams,
  TaskListResponse,
  UpdateTaskPayload,
} from '../../../types/task';
import { DASHBOARD_QUERY_KEYS } from '../../dashboard/hooks/useDashboard';

export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (params: TaskListParams) => [...TASK_QUERY_KEYS.lists(), params] as const,
  details: () => [...TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
};

export const useTaskList = (params: TaskListParams = {}) => {
  return useQuery<TaskListResponse, Error>({
    queryKey: TASK_QUERY_KEYS.list(params),
    queryFn: () => tasksApi.list(params),
  });
};

export const useTaskDetail = (id: string | undefined) => {
  return useQuery<Task, Error>({
    queryKey: TASK_QUERY_KEYS.detail(id || ''),
    queryFn: () => tasksApi.get(id!),
    enabled: Boolean(id),
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskPayload>({
    mutationFn: (payload) => tasksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};

export const useUpdateTaskMutation = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, UpdateTaskPayload>({
    mutationFn: (payload) => tasksApi.update(taskId, payload),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(taskId), updatedTask);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};

export const useCompleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, string>({
    mutationFn: (taskId) => tasksApi.complete(taskId),
    onSuccess: (completedTask) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(completedTask.id), completedTask);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};

export const useCancelTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, string>({
    mutationFn: (taskId) => tasksApi.cancel(taskId),
    onSuccess: (cancelledTask) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(cancelledTask.id), cancelledTask);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};
