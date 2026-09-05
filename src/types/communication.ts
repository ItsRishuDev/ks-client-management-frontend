export type NotificationChannel = 'EMAIL' | 'WHATSAPP' | 'IN_APP';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface NotificationTemplate {
  id: string;
  firm: string;
  name: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variables: string[];
  active: boolean;
  created_by: string | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  firm: string;
  user: string | null;
  user_name?: string;
  template: string | null;
  template_name?: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject: string;
  body: string;
  recipient_email: string;
  recipient_phone: string;
  related_entity_type: string;
  related_entity_id: string | null;
  metadata: Record<string, unknown>;
  scheduled_at: string | null;
  sent_at: string | null;
  read_at: string | null;
  failure_reason: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateListParams {
  channel?: NotificationChannel | '';
  active?: boolean | string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface TemplateListResponse {
  items: NotificationTemplate[];
  page: number;
  page_size: number;
  total: number;
}

export interface NotificationListParams {
  channel?: NotificationChannel | '';
  status?: NotificationStatus | '';
  related_entity_type?: string;
  recipient?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface NotificationListResponse {
  items: Notification[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateTemplatePayload {
  name: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  variables?: string[];
  active?: boolean;
}

export interface UpdateTemplatePayload {
  name?: string;
  channel?: NotificationChannel;
  subject?: string;
  body?: string;
  variables?: string[];
  active?: boolean;
}

export interface SendCommunicationPayload {
  template_id?: string | null;
  channel?: NotificationChannel;
  subject?: string;
  body?: string;
  recipient_email?: string;
  recipient_phone?: string;
  user_id?: string | null;
  context_data?: Record<string, string | number>;
  related_entity_type?: string;
  related_entity_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface SendCommunicationResponse {
  notification: Notification;
  whatsapp_url?: string;
}

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  IN_APP: 'In-App',
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  PENDING: 'Pending',
  SENT: 'Sent',
  DELIVERED: 'Delivered',
  READ: 'Read',
  FAILED: 'Failed',
};

export const NOTIFICATION_STATUS_BADGE_VARIANTS: Record<
  NotificationStatus,
  'neutral' | 'primary' | 'warning' | 'success' | 'danger'
> = {
  PENDING: 'warning',
  SENT: 'primary',
  DELIVERED: 'success',
  READ: 'neutral',
  FAILED: 'danger',
};

export const NOTIFICATION_CHANNEL_BADGE_VARIANTS: Record<
  NotificationChannel,
  'neutral' | 'primary' | 'warning' | 'success' | 'danger'
> = {
  EMAIL: 'primary',
  WHATSAPP: 'success',
  IN_APP: 'neutral',
};
