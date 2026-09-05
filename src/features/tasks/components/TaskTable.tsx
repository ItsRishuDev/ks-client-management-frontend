import React from 'react';
import { Check, Edit, Eye } from 'lucide-react';
import type { Task } from '../../../types/task';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/Table';
import { TaskDueDate, TaskPriorityBadge, TaskStatusBadge } from './taskBadges';

export interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  canComplete?: boolean;
  canEdit?: boolean;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  isLoading,
  canComplete = true,
  canEdit = true,
  onSelectTask,
  onEditTask,
  onCompleteTask,
}) => {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Title & Details</TableHead>
            <TableHead>Client & Context</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton variant="text" width="80%" /></TableCell>
              <TableCell><Skeleton variant="text" width="60%" /></TableCell>
              <TableCell><Skeleton variant="text" width="50%" /></TableCell>
              <TableCell><Skeleton variant="text" width={60} /></TableCell>
              <TableCell><Skeleton variant="text" width={90} /></TableCell>
              <TableCell><Skeleton variant="text" width={70} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No Tasks Found"
        description="No operational tasks match your active filters or search criteria."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task Title & Details</TableHead>
          <TableHead>Client & Context</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const isCompleteable = canComplete && task.status !== 'COMPLETED' && task.status !== 'CANCELLED';

          return (
            <TableRow
              key={task.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectTask(task)}
            >
              <TableCell>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-slate-500)',
                        marginTop: '2px',
                        maxWidth: '320px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {task.description}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div>
                  {task.client_name ? (
                    <div style={{ fontWeight: 500, color: 'var(--color-slate-800)' }}>
                      {task.client_name}{' '}
                      {task.client_code && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontFamily: 'var(--font-mono)' }}>
                          ({task.client_code})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-slate-400)', fontSize: '0.8125rem' }}>General Practice</span>
                  )}
                  {task.gstin && (
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-600)' }}>
                      GSTIN: {task.gstin}
                    </div>
                  )}
                  {task.compliance_label && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', fontWeight: 500 }}>
                      📋 {task.compliance_label}
                    </div>
                  )}
                  {task.requisition_label && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-purple-700)', fontWeight: 500 }}>
                      📄 {task.requisition_label}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                {task.assigned_user_name ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-slate-800)' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-100)',
                        color: 'var(--color-primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.6875rem',
                      }}
                    >
                      {task.assigned_user_name.charAt(0).toUpperCase()}
                    </div>
                    <span>{task.assigned_user_name}</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-slate-400)', fontSize: '0.8125rem', fontStyle: 'italic' }}>
                    Unassigned
                  </span>
                )}
              </TableCell>

              <TableCell>
                <TaskPriorityBadge priority={task.priority} />
              </TableCell>

              <TableCell>
                <TaskDueDate dueDate={task.due_date} status={task.status} />
              </TableCell>

              <TableCell>
                <TaskStatusBadge status={task.status} />
              </TableCell>

              <TableCell style={{ textAlign: 'right' }}>
                <div
                  style={{ display: 'inline-flex', gap: '6px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isCompleteable && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onCompleteTask(task)}
                      title="Mark task as completed"
                    >
                      <Check size={14} style={{ marginRight: '4px' }} />
                      Done
                    </Button>
                  )}
                  {canEdit && task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                    >
                      <Edit size={14} />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectTask(task)}
                    title="View details"
                  >
                    <Eye size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
