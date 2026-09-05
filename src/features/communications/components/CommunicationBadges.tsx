import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import {
  NOTIFICATION_CHANNEL_BADGE_VARIANTS,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_STATUS_BADGE_VARIANTS,
  NOTIFICATION_STATUS_LABELS,
  type NotificationChannel,
  type NotificationStatus,
} from '../../../types/communication';

export interface ChannelBadgeProps {
  channel: NotificationChannel;
  size?: 'sm' | 'md';
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel, size = 'sm' }) => {
  const variant = NOTIFICATION_CHANNEL_BADGE_VARIANTS[channel] || 'neutral';
  const label = NOTIFICATION_CHANNEL_LABELS[channel] || channel;

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
};

export interface CommunicationStatusBadgeProps {
  status: NotificationStatus;
  size?: 'sm' | 'md';
}

export const CommunicationStatusBadge: React.FC<CommunicationStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const variant = NOTIFICATION_STATUS_BADGE_VARIANTS[status] || 'neutral';
  const label = NOTIFICATION_STATUS_LABELS[status] || status;

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
};
