import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communicationsApi } from '../../../api/communications';
import type {
  CreateTemplatePayload,
  Notification,
  NotificationListParams,
  NotificationListResponse,
  NotificationTemplate,
  SendCommunicationPayload,
  SendCommunicationResponse,
  TemplateListParams,
  TemplateListResponse,
  UpdateTemplatePayload,
} from '../../../types/communication';

export const COMMUNICATION_QUERY_KEYS = {
  all: ['communications'] as const,
  templates: () => [...COMMUNICATION_QUERY_KEYS.all, 'templates'] as const,
  templateLists: () => [...COMMUNICATION_QUERY_KEYS.templates(), 'list'] as const,
  templateList: (params: TemplateListParams) => [...COMMUNICATION_QUERY_KEYS.templateLists(), params] as const,
  templateDetails: () => [...COMMUNICATION_QUERY_KEYS.templates(), 'detail'] as const,
  templateDetail: (id: string) => [...COMMUNICATION_QUERY_KEYS.templateDetails(), id] as const,
  notifications: () => [...COMMUNICATION_QUERY_KEYS.all, 'notifications'] as const,
  notificationLists: () => [...COMMUNICATION_QUERY_KEYS.notifications(), 'list'] as const,
  notificationList: (params: NotificationListParams) => [...COMMUNICATION_QUERY_KEYS.notificationLists(), params] as const,
};

export const useTemplateList = (params: TemplateListParams = {}) => {
  return useQuery<TemplateListResponse, Error>({
    queryKey: COMMUNICATION_QUERY_KEYS.templateList(params),
    queryFn: () => communicationsApi.listTemplates(params),
  });
};

export const useTemplateDetail = (id: string | undefined) => {
  return useQuery<NotificationTemplate, Error>({
    queryKey: COMMUNICATION_QUERY_KEYS.templateDetail(id || ''),
    queryFn: () => communicationsApi.getTemplate(id!),
    enabled: Boolean(id),
  });
};

export const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<NotificationTemplate, Error, CreateTemplatePayload>({
    mutationFn: (payload) => communicationsApi.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.templates() });
    },
  });
};

export const useUpdateTemplateMutation = (templateId: string) => {
  const queryClient = useQueryClient();
  return useMutation<NotificationTemplate, Error, UpdateTemplatePayload>({
    mutationFn: (payload) => communicationsApi.updateTemplate(templateId, payload),
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(COMMUNICATION_QUERY_KEYS.templateDetail(templateId), updatedTemplate);
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.templates() });
    },
  });
};

export const useNotificationList = (params: NotificationListParams = {}) => {
  return useQuery<NotificationListResponse, Error>({
    queryKey: COMMUNICATION_QUERY_KEYS.notificationList(params),
    queryFn: () => communicationsApi.listNotifications(params),
  });
};

export const useSendCommunicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SendCommunicationResponse, Error, SendCommunicationPayload>({
    mutationFn: (payload) => communicationsApi.send(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.notifications() });
    },
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Notification, Error, string>({
    mutationFn: (notificationId) => communicationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNICATION_QUERY_KEYS.notifications() });
    },
  });
};
