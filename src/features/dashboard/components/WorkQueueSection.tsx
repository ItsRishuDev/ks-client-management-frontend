import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import type {
  DashboardWorkQueueResponse,
  QueueCategory,
} from '../../../types/dashboard';
import {
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  Skeleton,
} from '../../../components/ui';

export interface WorkQueueSectionProps {
  data?: DashboardWorkQueueResponse;
  isLoading: boolean;
  selectedCategory: QueueCategory;
  onSelectCategory: (cat: QueueCategory) => void;
  assignedToMe: boolean;
}

export const WorkQueueSection: React.FC<WorkQueueSectionProps> = ({
  data,
  isLoading,
  selectedCategory,
  onSelectCategory,
  assignedToMe,
}) => {
  const complianceItems = data?.compliance || [];
  const taskItems = data?.tasks || [];
  const documentItems = data?.documents || [];
  const receivableItems = data?.receivables || [];

  const totalCount =
    complianceItems.length + taskItems.length + documentItems.length + receivableItems.length;

  const renderPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return <Badge variant="danger" size="sm">{priority}</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning" size="sm">{priority}</Badge>;
      case 'LOW':
      default:
        return <Badge variant="neutral" size="sm">{priority || 'NORMAL'}</Badge>;
    }
  };

  const renderStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <Badge variant="danger" size="sm" dot>OVERDUE</Badge>;
    }
    switch (status) {
      case 'READY_TO_FILE':
      case 'ACCEPTED':
      case 'PAID':
        return <Badge variant="success" size="sm">{status}</Badge>;
      case 'IN_PROGRESS':
      case 'UNDER_REVIEW':
      case 'PARTIALLY_PAID':
        return <Badge variant="info" size="sm">{status}</Badge>;
      case 'DOCUMENTS_PENDING':
      case 'PENDING':
      case 'REQUESTED':
        return <Badge variant="warning" size="sm">{status}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const renderTableRows = () => {
    if (isLoading) {
      return [1, 2, 3, 4].map((i) => (
        <TableRow key={i}>
          <TableCell><Skeleton variant="text" width="80%" /></TableCell>
          <TableCell><Skeleton variant="text" width="60%" /></TableCell>
          <TableCell><Skeleton variant="text" width="40%" /></TableCell>
          <TableCell><Skeleton variant="text" width="50%" /></TableCell>
          <TableCell><Skeleton variant="text" width="70%" /></TableCell>
          <TableCell><Skeleton variant="text" width="40%" /></TableCell>
        </TableRow>
      ));
    }

    const rows: React.ReactNode[] = [];

    // Compliance Items
    if (selectedCategory === 'all' || selectedCategory === 'compliance') {
      complianceItems.forEach((item) => {
        rows.push(
          <TableRow key={`comp-${item.id}`}>
            <TableCell>
              <div className="work-queue-item-title">
                {item.return_type} ({item.tax_period})
              </div>
              <div className="work-queue-item-sub">
                GSTIN: {item.gstin || 'N/A'} • FY {item.financial_year}
              </div>
            </TableCell>
            <TableCell>
              <Link to={`/clients`} style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}>
                {item.client_name}
              </Link>
            </TableCell>
            <TableCell>{renderPriorityBadge(item.priority)}</TableCell>
            <TableCell>
              <span style={{ color: item.is_overdue ? 'var(--color-danger-text)' : undefined, fontWeight: item.is_overdue ? 600 : 400 }}>
                {item.due_date || 'No date'}
              </span>
            </TableCell>
            <TableCell>{item.assigned_user_name || 'Unassigned'}</TableCell>
            <TableCell>{renderStatusBadge(item.status, item.is_overdue)}</TableCell>
          </TableRow>
        );
      });
    }

    // Task Items
    if (selectedCategory === 'all' || selectedCategory === 'tasks') {
      taskItems.forEach((item) => {
        rows.push(
          <TableRow key={`task-${item.id}`}>
            <TableCell>
              <div className="work-queue-item-title">{item.title}</div>
              <div className="work-queue-item-sub">Task</div>
            </TableCell>
            <TableCell>
              {item.client_name ? (
                <Link to={`/clients`} style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}>
                  {item.client_name}
                </Link>
              ) : (
                <span style={{ color: 'var(--color-slate-400)' }}>General Firm</span>
              )}
            </TableCell>
            <TableCell>{renderPriorityBadge(item.priority)}</TableCell>
            <TableCell>
              <span style={{ color: item.is_overdue ? 'var(--color-danger-text)' : undefined, fontWeight: item.is_overdue ? 600 : 400 }}>
                {item.due_date || 'No date'}
              </span>
            </TableCell>
            <TableCell>{item.assigned_user_name || 'Unassigned'}</TableCell>
            <TableCell>{renderStatusBadge(item.status, item.is_overdue)}</TableCell>
          </TableRow>
        );
      });
    }

    // Document Requisitions
    if (selectedCategory === 'all' || selectedCategory === 'documents') {
      documentItems.forEach((item) => {
        rows.push(
          <TableRow key={`doc-${item.id}`}>
            <TableCell>
              <div className="work-queue-item-title">{item.document_type}</div>
              <div className="work-queue-item-sub">Requisition: {item.description || 'Document Request'}</div>
            </TableCell>
            <TableCell>
              <Link to={`/clients`} style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}>
                {item.client_name}
              </Link>
            </TableCell>
            <TableCell>{renderPriorityBadge(item.priority)}</TableCell>
            <TableCell>
              <span style={{ color: item.is_overdue ? 'var(--color-danger-text)' : undefined, fontWeight: item.is_overdue ? 600 : 400 }}>
                {item.due_date || 'No date'}
              </span>
            </TableCell>
            <TableCell>{item.assigned_user_name || 'Unassigned'}</TableCell>
            <TableCell>{renderStatusBadge(item.status, item.is_overdue)}</TableCell>
          </TableRow>
        );
      });
    }

    // Receivables
    if (selectedCategory === 'all' || selectedCategory === 'receivables') {
      receivableItems.forEach((item) => {
        rows.push(
          <TableRow key={`inv-${item.id}`}>
            <TableCell>
              <div className="work-queue-item-title">Invoice #{item.invoice_number}</div>
              <div className="work-queue-item-sub">
                Balance: ₹{parseFloat(item.outstanding_balance).toLocaleString('en-IN')} of ₹{parseFloat(item.total_amount).toLocaleString('en-IN')}
              </div>
            </TableCell>
            <TableCell>
              <Link to={`/clients`} style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}>
                {item.client_name}
              </Link>
            </TableCell>
            <TableCell><Badge variant="neutral" size="sm">BILLING</Badge></TableCell>
            <TableCell>
              <span style={{ color: item.is_overdue ? 'var(--color-danger-text)' : undefined, fontWeight: item.is_overdue ? 600 : 400 }}>
                {item.due_date}
              </span>
            </TableCell>
            <TableCell>-</TableCell>
            <TableCell>{renderStatusBadge(item.status, item.is_overdue)}</TableCell>
          </TableRow>
        );
      });
    }

    return rows;
  };

  return (
    <div className="dashboard-section-card">
      <div className="dashboard-section-header">
        <div className="dashboard-section-title">
          <Layers size={20} style={{ color: 'var(--color-primary-600)' }} />
          <span>Operational Work Queue</span>
        </div>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
          {assignedToMe ? 'Showing items assigned to you' : 'Showing all firm open items'}
        </span>
      </div>

      <div className="work-queue-filter-row">
        <div className="work-queue-tabs">
          <button
            type="button"
            className={`work-queue-tab-btn ${selectedCategory === 'all' ? 'work-queue-tab-btn--active' : ''}`}
            onClick={() => onSelectCategory('all')}
          >
            All <span className="work-queue-tab-count">{totalCount}</span>
          </button>
          <button
            type="button"
            className={`work-queue-tab-btn ${selectedCategory === 'compliance' ? 'work-queue-tab-btn--active' : ''}`}
            onClick={() => onSelectCategory('compliance')}
          >
            Compliance <span className="work-queue-tab-count">{complianceItems.length}</span>
          </button>
          <button
            type="button"
            className={`work-queue-tab-btn ${selectedCategory === 'tasks' ? 'work-queue-tab-btn--active' : ''}`}
            onClick={() => onSelectCategory('tasks')}
          >
            Tasks <span className="work-queue-tab-count">{taskItems.length}</span>
          </button>
          <button
            type="button"
            className={`work-queue-tab-btn ${selectedCategory === 'documents' ? 'work-queue-tab-btn--active' : ''}`}
            onClick={() => onSelectCategory('documents')}
          >
            Documents <span className="work-queue-tab-count">{documentItems.length}</span>
          </button>
          {receivableItems.length > 0 && (
            <button
              type="button"
              className={`work-queue-tab-btn ${selectedCategory === 'receivables' ? 'work-queue-tab-btn--active' : ''}`}
              onClick={() => onSelectCategory('receivables')}
            >
              Receivables <span className="work-queue-tab-count">{receivableItems.length}</span>
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-section-body" style={{ padding: 0 }}>
        {!isLoading && totalCount === 0 ? (
          <EmptyState
            title="Work Queue Clear"
            description={
              assignedToMe
                ? 'You have no open tasks, pending filings, or documents assigned to you.'
                : 'No open tasks or pending compliance obligations found.'
            }
          />
        ) : !isLoading && ((selectedCategory === 'compliance' && complianceItems.length === 0) ||
            (selectedCategory === 'tasks' && taskItems.length === 0) ||
            (selectedCategory === 'documents' && documentItems.length === 0) ||
            (selectedCategory === 'receivables' && receivableItems.length === 0)) ? (
          <EmptyState
            title={`No ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Items`}
            description={`There are currently no open ${selectedCategory} items in this queue.`}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Item</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableRows()}</TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
