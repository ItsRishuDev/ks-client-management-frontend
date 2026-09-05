import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { useAuth } from '../../../context/useAuth';
import { useToast } from '../../../components/ui/useToast';
import { useClientsList, useClientGstRegistrations, useFirmUsers } from '../../clients/hooks/useClients';
import { useCreateTaskMutation } from '../hooks/useTasks';
import {
  TASK_PRIORITY_LABELS,
  type TaskPriority,
} from '../../../types/task';
import { userHasPermission } from '../../../utils/permissions';

export interface CreateTaskModalProps {
  isOpen: boolean;
  preselectedClientId?: string;
  preselectedComplianceId?: string;
  preselectedRequisitionId?: string;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  preselectedClientId,
  preselectedComplianceId,
  preselectedRequisitionId,
  onClose,
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [gstRegistrationId, setGstRegistrationId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: clientsData, isLoading: isLoadingClients } = useClientsList({ page_size: 100 });
  const { data: gstRegistrations = [] } = useClientGstRegistrations(clientId);
  const { data: firmUsers = [] } = useFirmUsers();

  const createTaskMutation = useCreateTaskMutation();
  const canAssign = userHasPermission(user, 'tasks.assign');

  const clients = clientsData?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required.');
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        client_id: clientId || undefined,
        gst_registration_id: gstRegistrationId || undefined,
        compliance_id: preselectedComplianceId || undefined,
        document_requisition_id: preselectedRequisitionId || undefined,
        assigned_user_id: canAssign ? (assignedUserId || undefined) : user?.id,
        priority,
        due_date: dueDate || undefined,
      });

      success(`Task "${title}" created successfully.`);
      setTitle('');
      setDescription('');
      setClientId('');
      setGstRegistrationId('');
      setDueDate('');
      setErrorMsg('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task.';
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description="Record a new operational practice work item or assignment."
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
          onChange={(e) => {
            setTitle(e.target.value);
            setErrorMsg('');
          }}
          placeholder="e.g. Verify purchase invoices against 2B"
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed instructions or context for the assignee..."
          rows={3}
        />

        <Select
          label="Client (Optional)"
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setGstRegistrationId('');
          }}
          disabled={isLoadingClients || !!preselectedClientId}
        >
          <option value="">General Practice Work (No Client)</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name || c.legal_name} ({c.client_code})
            </option>
          ))}
        </Select>

        {clientId && gstRegistrations.length > 0 && (
          <Select
            label="GSTIN Context (Optional)"
            value={gstRegistrationId}
            onChange={(e) => setGstRegistrationId(e.target.value)}
          >
            <option value="">All Registrations / General Client</option>
            {gstRegistrations.map((g) => (
              <option key={g.id} value={g.id}>
                {g.gstin} - {g.trade_name || g.legal_name} ({g.state_name})
              </option>
            ))}
          </Select>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

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
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)', fontStyle: 'italic' }}>
            Assigned to: {user?.name} (Self-assigned)
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={createTaskMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={createTaskMutation.isPending}>
            Create Task
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
