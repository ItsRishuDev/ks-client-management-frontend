import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { useAuth } from '../../../context/useAuth';
import { useToast } from '../../../components/ui/useToast';
import { useFirmUsers } from '../../clients/hooks/useClients';
import { useUpdateTaskMutation } from '../hooks/useTasks';
import {
  ALLOWED_TASK_TRANSITIONS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../../../types/task';
import { userHasPermission } from '../../../utils/permissions';

export interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { data: firmUsers = [] } = useFirmUsers();

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'TO_DO');
  const [assignedUserId, setAssignedUserId] = useState(task?.assigned_user || '');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useUpdateTaskMutation(task?.id || '');
  const canAssign = userHasPermission(user, 'tasks.assign');

  if (!task) return null;

  const allowableStatuses = [
    task.status,
    ...(ALLOWED_TASK_TRANSITIONS[task.status] || []),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        assigned_user_id: canAssign ? (assignedUserId || null) : undefined,
        due_date: dueDate || null,
      });

      success(`Task "${title}" updated.`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update task.';
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      description={`Update status, priority, or details for task #${task.id.slice(0, 8)}`}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: 'var(--color-danger-700)',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <Input
          label="Task Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {allowableStatuses.map((st) => (
              <option key={st} value={st}>
                {TASK_STATUS_LABELS[st]}
              </option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {Object.entries(TASK_PRIORITY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {canAssign ? (
            <Select
              label="Assignee"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {firmUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </Select>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>Assignee</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-slate-800)' }}>
                {task.assigned_user_name || 'Unassigned'}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
