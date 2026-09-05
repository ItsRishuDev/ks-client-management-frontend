import React from 'react';
import type { ComplianceStatus, PriorityLevel } from '../../../types/compliance';
import { Badge } from '../../../components/ui';

export const renderComplianceStatusBadge = (status: ComplianceStatus): React.ReactNode => {
  switch (status) {
    case 'OVERDUE':
      return <Badge variant="danger" size="sm" dot>OVERDUE</Badge>;
    case 'READY_TO_FILE':
      return <Badge variant="success" size="sm">READY TO FILE</Badge>;
    case 'FILED':
      return <Badge variant="success" size="sm" dot>FILED</Badge>;
    case 'VERIFIED':
      return <Badge variant="success" size="sm">VERIFIED</Badge>;
    case 'LATE':
      return <Badge variant="warning" size="sm">LATE FILED</Badge>;
    case 'IN_PREPARATION':
      return <Badge variant="info" size="sm">IN PREPARATION</Badge>;
    case 'PREPARED':
      return <Badge variant="info" size="sm">PREPARED</Badge>;
    case 'DATA_RECEIVED':
      return <Badge variant="info" size="sm">DATA RECEIVED</Badge>;
    case 'DOCUMENTS_PENDING':
      return <Badge variant="warning" size="sm">DOCS PENDING</Badge>;
    case 'UPCOMING':
      return <Badge variant="neutral" size="sm">UPCOMING</Badge>;
    case 'DEFECTIVE':
      return <Badge variant="danger" size="sm">DEFECTIVE</Badge>;
    case 'REVISED':
      return <Badge variant="warning" size="sm">REVISED</Badge>;
    case 'NOT_DUE':
    default:
      return <Badge variant="neutral" size="sm">{status.replace('_', ' ')}</Badge>;
  }
};

export const renderPriorityBadge = (priority: PriorityLevel): React.ReactNode => {
  switch (priority) {
    case 'URGENT':
      return <Badge variant="danger" size="sm">URGENT</Badge>;
    case 'HIGH':
      return <Badge variant="danger" size="sm">HIGH</Badge>;
    case 'MEDIUM':
      return <Badge variant="warning" size="sm">MEDIUM</Badge>;
    case 'LOW':
    default:
      return <Badge variant="neutral" size="sm">LOW</Badge>;
  }
};
