import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import {
  DOCUMENT_TYPE_LABELS,
  PRIORITY_LABELS,
  REQUISITION_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  type DocumentReviewStatus,
  type DocumentType,
  type PriorityLevel,
  type RequisitionStatus,
} from '../../../types/document';

export const renderRequisitionStatusBadge = (status: RequisitionStatus): React.ReactNode => {
  const label = REQUISITION_STATUS_LABELS[status] || status;
  switch (status) {
    case 'ACCEPTED':
      return <Badge variant="success">{label}</Badge>;
    case 'RECEIVED':
      return <Badge variant="primary">{label}</Badge>;
    case 'UNDER_REVIEW':
      return <Badge variant="info">{label}</Badge>;
    case 'PENDING':
      return <Badge variant="warning">{label}</Badge>;
    case 'REQUESTED':
      return <Badge variant="neutral">{label}</Badge>;
    case 'REJECTED':
    case 'EXPIRED':
      return <Badge variant="danger">{label}</Badge>;
    default:
      return <Badge variant="neutral">{label}</Badge>;
  }
};

export const renderReviewStatusBadge = (status: DocumentReviewStatus): React.ReactNode => {
  const label = REVIEW_STATUS_LABELS[status] || status;
  switch (status) {
    case 'ACCEPTED':
      return <Badge variant="success">{label}</Badge>;
    case 'UNDER_REVIEW':
      return <Badge variant="info">{label}</Badge>;
    case 'PENDING':
      return <Badge variant="warning">{label}</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">{label}</Badge>;
    default:
      return <Badge variant="neutral">{label}</Badge>;
  }
};

export const renderPriorityBadge = (priority: PriorityLevel): React.ReactNode => {
  const label = PRIORITY_LABELS[priority] || priority;
  switch (priority) {
    case 'URGENT':
      return <Badge variant="danger">{label}</Badge>;
    case 'HIGH':
      return <Badge variant="warning">{label}</Badge>;
    case 'MEDIUM':
      return <Badge variant="info">{label}</Badge>;
    case 'LOW':
      return <Badge variant="neutral">{label}</Badge>;
    default:
      return <Badge variant="neutral">{label}</Badge>;
  }
};

export const renderDocumentTypeBadge = (type: DocumentType): React.ReactNode => {
  const label = DOCUMENT_TYPE_LABELS[type] || type;
  return <Badge variant="neutral">{label}</Badge>;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
