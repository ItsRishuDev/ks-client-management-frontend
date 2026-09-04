export interface DashboardSummary {
  total_clients: number;
  due_today: number;
  overdue_compliance: number;
  documents_pending: number;
  tasks_due_today: number;
  outstanding_invoices: string;
}

export type QueueCategory = 'all' | 'compliance' | 'tasks' | 'documents' | 'receivables';

export interface BaseQueueItem {
  id: string;
  type: 'compliance' | 'document' | 'task' | 'receivable';
  client_id?: string;
  client_name?: string;
  due_date?: string | null;
  status: string;
  priority?: string;
  assigned_user_id?: string | null;
  assigned_user_name?: string | null;
  is_overdue: boolean;
}

export interface ComplianceQueueItem extends BaseQueueItem {
  type: 'compliance';
  gstin: string;
  return_type: string;
  financial_year: string;
  tax_period: string;
}

export interface DocumentQueueItem extends BaseQueueItem {
  type: 'document';
  document_type: string;
  description?: string;
}

export interface TaskQueueItem extends BaseQueueItem {
  type: 'task';
  title: string;
}

export interface ReceivableQueueItem {
  id: string;
  type: 'receivable';
  invoice_number: string;
  client_id: string;
  client_name: string;
  total_amount: string;
  outstanding_balance: string;
  due_date: string;
  status: string;
  is_overdue: boolean;
}

export interface DashboardWorkQueueResponse {
  compliance?: ComplianceQueueItem[];
  documents?: DocumentQueueItem[];
  tasks?: TaskQueueItem[];
  receivables?: ReceivableQueueItem[];
}

export interface UpcomingComplianceItem {
  id: string;
  client_name: string;
  gstin: string;
  return_type: string;
  tax_period: string;
  due_date: string;
  status: string;
  priority: string;
  assigned_user_name?: string | null;
}

export interface UpcomingDocumentItem {
  id: string;
  client_name: string;
  document_type: string;
  due_date: string;
  status: string;
  priority: string;
  assigned_user_name?: string | null;
}

export interface UpcomingTaskItem {
  id: string;
  title: string;
  client_name?: string | null;
  due_date: string;
  status: string;
  priority: string;
  assigned_user_name?: string | null;
}

export interface UpcomingDeadlinesResponse {
  range_days: number;
  from_date: string;
  to_date: string;
  compliance: UpcomingComplianceItem[];
  documents: UpcomingDocumentItem[];
  tasks: UpcomingTaskItem[];
}

export interface StaffWorkloadItem {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  active_tasks: number;
  overdue_tasks: number;
  assigned_compliance: number;
  pending_documents: number;
  total_workload: number;
}
