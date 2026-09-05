import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/useToast';
import { userHasPermission } from '../utils/permissions';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { ErrorState } from '../components/ui/ErrorState';
import { useFirmUsers } from '../features/clients/hooks/useClients';
import {
  useTaskList,
  useCompleteTaskMutation,
} from '../features/tasks/hooks/useTasks';
import { TaskTable } from '../features/tasks/components/TaskTable';
import { CreateTaskModal } from '../features/tasks/components/CreateTaskModal';
import { EditTaskModal } from '../features/tasks/components/EditTaskModal';
import { TaskDetailModal } from '../features/tasks/components/TaskDetailModal';
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type Task,
  type TaskListParams,
  type TaskPriority,
  type TaskStatus,
} from '../types/task';

type QuickTab = 'ALL' | 'MY_TASKS' | 'IN_PROGRESS' | 'WAITING' | 'OVERDUE' | 'COMPLETED';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<QuickTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  const { data: firmUsers = [] } = useFirmUsers();
  const completeMutation = useCompleteTaskMutation();

  const canCreate = userHasPermission(user, 'tasks.create');
  const canComplete = userHasPermission(user, 'tasks.complete');

  // Compute query params based on active tab and custom filters
  const queryParams = useMemo(() => {
    const params: TaskListParams = {
      page: currentPage,
      page_size: pageSize,
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (priorityFilter) {
      params.priority = priorityFilter;
    }

    if (activeTab === 'MY_TASKS') {
      if (user?.id) params.assigned_user_id = user.id;
      if (statusFilter) params.status = statusFilter;
    } else if (activeTab === 'IN_PROGRESS') {
      params.status = 'IN_PROGRESS';
    } else if (activeTab === 'WAITING') {
      params.status = 'WAITING';
    } else if (activeTab === 'OVERDUE') {
      params.overdue = true;
    } else if (activeTab === 'COMPLETED') {
      params.status = 'COMPLETED';
    } else {
      // ALL tab
      if (statusFilter) params.status = statusFilter;
      if (assigneeFilter) params.assigned_user_id = assigneeFilter;
    }

    return params;
  }, [activeTab, searchTerm, priorityFilter, statusFilter, assigneeFilter, currentPage, user]);

  const { data: taskData, isLoading, isError, error, refetch } = useTaskList(queryParams);

  // Overall metric counts (queried across unpaginated / whole firm scope)
  const { data: allTasksData } = useTaskList({ page_size: 100 });

  const metrics = useMemo(() => {
    const allTasks = allTasksData?.items || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = allTasks.length;
    const myTasks = allTasks.filter((t) => t.assigned_user === user?.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
    const inProgress = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completed = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const overdue = allTasks.filter((t) => {
      if (!t.due_date || t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      const d = new Date(t.due_date);
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;

    return { total, myTasks, inProgress, completed, overdue };
  }, [allTasksData, user?.id]);

  const handleCompleteTask = async (task: Task) => {
    try {
      await completeMutation.mutateAsync(task.id);
      success(`Task "${task.title}" marked as completed.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete task.';
      toastError(msg);
    }
  };

  const tasks = taskData?.items || [];
  const totalItems = taskData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="tasks-container">
      {/* Header */}
      <div className="tasks-header">
        <div className="tasks-header-title">
          <h1>Tasks & Work Management</h1>
          <p>Coordinate practice work items, track task assignments, and monitor deadlines.</p>
        </div>
        <div>
          {canCreate && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={16} style={{ marginRight: '6px' }} />
              Create Task
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="tasks-kpi-grid">
        <div className="tasks-kpi-card">
          <div className="tasks-kpi-title">Total Tasks</div>
          <div className="tasks-kpi-value">{metrics.total}</div>
          <div className="tasks-kpi-subtitle">All practice work items</div>
        </div>

        <div className="tasks-kpi-card" style={{ borderLeft: '4px solid var(--color-primary-500)' }}>
          <div className="tasks-kpi-title" style={{ color: 'var(--color-primary-700)' }}>My Open Tasks</div>
          <div className="tasks-kpi-value" style={{ color: 'var(--color-primary-700)' }}>{metrics.myTasks}</div>
          <div className="tasks-kpi-subtitle">Assigned directly to you</div>
        </div>

        <div className="tasks-kpi-card" style={{ borderLeft: '4px solid var(--color-info-500)' }}>
          <div className="tasks-kpi-title" style={{ color: 'var(--color-info-700)' }}>In Progress</div>
          <div className="tasks-kpi-value" style={{ color: 'var(--color-info-700)' }}>{metrics.inProgress}</div>
          <div className="tasks-kpi-subtitle">Actively being worked on</div>
        </div>

        <div className="tasks-kpi-card" style={{ borderLeft: '4px solid var(--color-danger-500)' }}>
          <div className="tasks-kpi-title" style={{ color: 'var(--color-danger-700)' }}>Overdue Tasks</div>
          <div className="tasks-kpi-value" style={{ color: 'var(--color-danger-700)' }}>{metrics.overdue}</div>
          <div className="tasks-kpi-subtitle">Past statutory or internal due date</div>
        </div>

        <div className="tasks-kpi-card" style={{ borderLeft: '4px solid var(--color-success-500)' }}>
          <div className="tasks-kpi-title" style={{ color: 'var(--color-success-700)' }}>Completed</div>
          <div className="tasks-kpi-value" style={{ color: 'var(--color-success-700)' }}>{metrics.completed}</div>
          <div className="tasks-kpi-subtitle">Successfully finalized</div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="tasks-filter-bar">
        {/* Quick Tabs */}
        <div className="tasks-quick-tabs">
          <button
            type="button"
            className={`tasks-tab-pill ${activeTab === 'ALL' ? 'tasks-tab-pill--active' : ''}`}
            onClick={() => {
              setActiveTab('ALL');
              setCurrentPage(1);
            }}
          >
            All Tasks
          </button>
          <button
            type="button"
            className={`tasks-tab-pill ${activeTab === 'MY_TASKS' ? 'tasks-tab-pill--active' : ''}`}
            onClick={() => {
              setActiveTab('MY_TASKS');
              setCurrentPage(1);
            }}
          >
            My Tasks ({metrics.myTasks})
          </button>
          <button
            type="button"
            className={`tasks-tab-pill ${activeTab === 'IN_PROGRESS' ? 'tasks-tab-pill--active' : ''}`}
            onClick={() => {
              setActiveTab('IN_PROGRESS');
              setCurrentPage(1);
            }}
          >
            In Progress ({metrics.inProgress})
          </button>
          <button
            type="button"
            className={`tasks-tab-pill ${activeTab === 'WAITING' ? 'tasks-tab-pill--active' : ''}`}
            onClick={() => {
              setActiveTab('WAITING');
              setCurrentPage(1);
            }}
          >
            Waiting
          </button>
          <button
            type="button"
            className={`tasks-tab-pill ${activeTab === 'OVERDUE' ? 'tasks-tab-pill--active' : ''}`}
            onClick={() => {
              setActiveTab('OVERDUE');
              setCurrentPage(1);
            }}
          >
            Overdue ({metrics.overdue})
          </button>
          <button
            type="button"
            className={`tasks-tab-pill ${activeTab === 'COMPLETED' ? 'tasks-tab-pill--active' : ''}`}
            onClick={() => {
              setActiveTab('COMPLETED');
              setCurrentPage(1);
            }}
          >
            Completed ({metrics.completed})
          </button>
        </div>

        {/* Filter Controls Grid */}
        <div className="tasks-filter-controls">
          <Input
            placeholder="Search by title, description, client, or GSTIN..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as TaskPriority | '');
              setCurrentPage(1);
            }}
          >
            <option value="">All Priorities</option>
            {Object.entries(TASK_PRIORITY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label} Priority
              </option>
            ))}
          </Select>

          {activeTab === 'ALL' && (
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as TaskStatus | '');
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {Object.entries(TASK_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </Select>
          )}

          {activeTab === 'ALL' && (
            <Select
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Assignees</option>
              {firmUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      {/* Task Content Table */}
      {isError ? (
        <ErrorState
          title="Failed to Load Tasks"
          description={error?.message || 'An error occurred while loading tasks.'}
          onRetry={() => refetch()}
        />
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--color-slate-200)', overflow: 'hidden' }}>
          <TaskTable
            tasks={tasks}
            isLoading={isLoading}
            canComplete={canComplete}
            canEdit={canCreate}
            onSelectTask={(task) => setSelectedTaskForDetail(task)}
            onEditTask={(task) => setSelectedTaskForEdit(task)}
            onCompleteTask={handleCompleteTask}
          />

          {totalItems > pageSize && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--color-slate-200)', display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* Edit Task Modal */}
      {selectedTaskForEdit && (
        <EditTaskModal
          task={selectedTaskForEdit}
          isOpen={!!selectedTaskForEdit}
          onClose={() => setSelectedTaskForEdit(null)}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTaskForDetail && (
        <TaskDetailModal
          task={selectedTaskForDetail}
          isOpen={!!selectedTaskForDetail}
          canComplete={canComplete}
          canEdit={canCreate}
          onClose={() => setSelectedTaskForDetail(null)}
          onOpenEdit={(task) => setSelectedTaskForEdit(task)}
        />
      )}
    </div>
  );
};
