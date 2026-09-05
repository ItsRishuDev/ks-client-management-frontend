import React from 'react';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import {
  TASK_PRIORITY_BADGE_VARIANTS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_BADGE_VARIANTS,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from '../../../types/task';

export interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const variant = TASK_STATUS_BADGE_VARIANTS[status] || 'neutral';
  const label = TASK_STATUS_LABELS[status] || status;

  let icon: React.ReactNode = null;
  if (status === 'COMPLETED') {
    icon = <CheckCircle2 size={12} style={{ marginRight: '4px' }} />;
  } else if (status === 'IN_PROGRESS') {
    icon = <Clock size={12} style={{ marginRight: '4px' }} />;
  } else if (status === 'WAITING') {
    icon = <AlertCircle size={12} style={{ marginRight: '4px' }} />;
  } else if (status === 'CANCELLED') {
    icon = <XCircle size={12} style={{ marginRight: '4px' }} />;
  }

  return (
    <Badge variant={variant} size="sm">
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {icon}
        {label}
      </span>
    </Badge>
  );
};

export interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  const variant = TASK_PRIORITY_BADGE_VARIANTS[priority] || 'neutral';
  const label = TASK_PRIORITY_LABELS[priority] || priority;

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
};

export interface TaskDueDateProps {
  dueDate: string | null;
  status: TaskStatus;
}

export const TaskDueDate: React.FC<TaskDueDateProps> = ({ dueDate, status }) => {
  if (!dueDate) {
    return <span style={{ color: 'var(--color-slate-400)' }}>No due date</span>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const isOverdue = due < today && status !== 'COMPLETED' && status !== 'CANCELLED';
  const isDueToday = due.getTime() === today.getTime() && status !== 'COMPLETED' && status !== 'CANCELLED';

  const formatted = due.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{formatted}</span>
      {isOverdue && (
        <Badge variant="danger" size="sm">
          OVERDUE
        </Badge>
      )}
      {isDueToday && (
        <Badge variant="warning" size="sm">
          TODAY
        </Badge>
      )}
    </div>
  );
};
