import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import {
  INVOICE_STATUS_BADGE_VARIANTS,
  INVOICE_STATUS_LABELS,
  PAYMENT_MODE_LABELS,
  type InvoiceStatus,
  type PaymentMode,
} from '../../../types/billing';

export interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const label = INVOICE_STATUS_LABELS[status] || status;
  const variant = INVOICE_STATUS_BADGE_VARIANTS[status] || 'neutral';
  return <Badge variant={variant}>{label}</Badge>;
};

export interface PaymentModeBadgeProps {
  mode: PaymentMode;
}

export const PaymentModeBadge: React.FC<PaymentModeBadgeProps> = ({ mode }) => {
  const label = PAYMENT_MODE_LABELS[mode] || mode;
  return <Badge variant="info">{label}</Badge>;
};
