export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'WAITING' | 'COMPLETED' | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  firm: string;
  client: string | null;
  client_name?: string;
  client_code?: string;
  entity: string | null;
  entity_name?: string;
  gst_registration: string | null;
  gstin?: string;
  compliance: string | null;
  compliance_label?: string;
  document_requisition: string | null;
  requisition_label?: string;
  invoice_id: string | null;
  title: string;
  description: string;
  assigned_user: string | null;
  assigned_user_name?: string;
  created_by: string | null;
  created_by_name?: string;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListParams {
  assigned_user_id?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  client_id?: string;
  entity_id?: string;
  gst_registration_id?: string;
  compliance_id?: string;
  document_requisition_id?: string;
  due_from?: string;
  due_to?: string;
  overdue?: boolean | string;
  unassigned?: boolean | string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface TaskListResponse {
  items: Task[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  client_id?: string;
  entity_id?: string;
  gst_registration_id?: string;
  compliance_id?: string;
  document_requisition_id?: string;
  assigned_user_id?: string;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  client_id?: string | null;
  entity_id?: string | null;
  gst_registration_id?: string | null;
  compliance_id?: string | null;
  document_requisition_id?: string | null;
  assigned_user_id?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TO_DO: 'To Do',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const TASK_STATUS_BADGE_VARIANTS: Record<TaskStatus, 'neutral' | 'primary' | 'warning' | 'success' | 'danger'> = {
  TO_DO: 'neutral',
  IN_PROGRESS: 'primary',
  WAITING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TASK_PRIORITY_BADGE_VARIANTS: Record<TaskPriority, 'neutral' | 'info' | 'warning' | 'danger'> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

export const ALLOWED_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TO_DO: ['IN_PROGRESS', 'WAITING', 'COMPLETED', 'CANCELLED'],
  IN_PROGRESS: ['TO_DO', 'WAITING', 'COMPLETED', 'CANCELLED'],
  WAITING: ['TO_DO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
