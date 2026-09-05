import React from 'react';
import { Check, X, Edit } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { useToast } from '../../../components/ui/useToast';
import { useCompleteTaskMutation, useCancelTaskMutation } from '../hooks/useTasks';
import { TaskDueDate, TaskPriorityBadge, TaskStatusBadge } from './taskBadges';
import type { Task } from '../../../types/task';

export interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  canComplete?: boolean;
  canEdit?: boolean;
  onClose: () => void;
  onOpenEdit: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  canComplete = true,
  canEdit = true,
  onClose,
  onOpenEdit,
}) => {
  const { success, error: toastError } = useToast();
  const completeMutation = useCompleteTaskMutation();
  const cancelMutation = useCancelTaskMutation();

  if (!task) return null;

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(task.id);
      success(`Task marked as completed.`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete task.';
      toastError(msg);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this task?')) {
      try {
        await cancelMutation.mutateAsync(task.id);
        success(`Task cancelled.`);
        onClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to cancel task.';
        toastError(msg);
      }
    }
  };

  const isActionable = task.status !== 'COMPLETED' && task.status !== 'CANCELLED';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      description={`Task ID: ${task.id}`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            {isActionable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                style={{ color: 'var(--color-danger-600)', borderColor: 'var(--color-danger-300)' }}
              >
                <X size={14} style={{ marginRight: '4px' }} />
                Cancel Task
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {canEdit && isActionable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenEdit(task);
                }}
              >
                <Edit size={14} style={{ marginRight: '4px' }} />
                Edit Task
              </Button>
            )}
            {canComplete && isActionable && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleComplete}
                loading={completeMutation.isPending}
              >
                <Check size={14} style={{ marginRight: '4px' }} />
                Mark as Done
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Status & Priority Ribbon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-slate-50)',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            border: '1px solid var(--color-slate-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>Status:</span>
            <TaskStatusBadge status={task.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>Priority:</span>
            <TaskPriorityBadge priority={task.priority} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>Due:</span>
            <TaskDueDate dueDate={task.due_date} status={task.status} />
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
            Description & Instructions
          </h4>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-slate-800)',
              backgroundColor: '#ffffff',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--color-slate-200)',
              whiteSpace: 'pre-wrap',
              minHeight: '60px',
            }}
          >
            {task.description || 'No detailed instructions provided.'}
          </p>
        </div>

        {/* Context & Relations Grid */}
        <div>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Work Context & Relations
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ padding: '0.625rem', backgroundColor: 'var(--color-slate-50)', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'block' }}>Client:</span>
              <strong style={{ color: 'var(--color-slate-900)' }}>
                {task.client_name ? `${task.client_name} (${task.client_code})` : 'General Practice Work'}
              </strong>
            </div>

            <div style={{ padding: '0.625rem', backgroundColor: 'var(--color-slate-50)', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'block' }}>Operating Entity:</span>
              <strong style={{ color: 'var(--color-slate-900)' }}>{task.entity_name || 'All / General'}</strong>
            </div>

            <div style={{ padding: '0.625rem', backgroundColor: 'var(--color-slate-50)', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'block' }}>Statutory GSTIN:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-slate-800)' }}>
                {task.gstin || 'None attached'}
              </span>
            </div>

            <div style={{ padding: '0.625rem', backgroundColor: 'var(--color-slate-50)', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'block' }}>GST Compliance Period:</span>
              <strong style={{ color: 'var(--color-primary-800)' }}>{task.compliance_label || 'None attached'}</strong>
            </div>

            {task.requisition_label && (
              <div style={{ padding: '0.625rem', backgroundColor: 'var(--color-purple-50)', borderRadius: '6px', gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-purple-700)', display: 'block' }}>Linked Document Requisition:</span>
                <strong style={{ color: 'var(--color-purple-900)' }}>{task.requisition_label}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Ownership & Audit Details */}
        <div
          style={{
            borderTop: '1px solid var(--color-slate-200)',
            paddingTop: '0.75rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--color-slate-500)',
          }}
        >
          <div>
            <strong>Assigned To:</strong> {task.assigned_user_name || 'Unassigned'}
          </div>
          <div>
            <strong>Created By:</strong> {task.created_by_name || 'System / Staff'}
          </div>
          <div>
            <strong>Created:</strong> {new Date(task.created_at).toLocaleString('en-IN')}
          </div>
          <div>
            <strong>Completed At:</strong> {task.completed_at ? new Date(task.completed_at).toLocaleString('en-IN') : 'Incomplete'}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
