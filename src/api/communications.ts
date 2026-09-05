import { apiClient } from './client';
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
} from '../types/communication';

export const communicationsApi = {
  listTemplates: async (params?: TemplateListParams): Promise<TemplateListResponse> => {
    return apiClient<TemplateListResponse>('/notification-templates/', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  getTemplate: async (templateId: string): Promise<NotificationTemplate> => {
    return apiClient<NotificationTemplate>(`/notification-templates/${templateId}/`, {
      method: 'GET',
    });
  },

  createTemplate: async (payload: CreateTemplatePayload): Promise<NotificationTemplate> => {
    return apiClient<NotificationTemplate>('/notification-templates/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateTemplate: async (templateId: string, payload: UpdateTemplatePayload): Promise<NotificationTemplate> => {
    return apiClient<NotificationTemplate>(`/notification-templates/${templateId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  listNotifications: async (params?: NotificationListParams): Promise<NotificationListResponse> => {
    return apiClient<NotificationListResponse>('/notifications/', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  send: async (payload: SendCommunicationPayload): Promise<SendCommunicationResponse> => {
    return apiClient<SendCommunicationResponse>('/communications/send/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    return apiClient<Notification>(`/notifications/${notificationId}/read/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};
