export type GSTReturnType =
  | 'GSTR_1'
  | 'GSTR_3B'
  | 'CMP_08'
  | 'GSTR_4'
  | 'GSTR_9'
  | 'GSTR_9C'
  | 'IFF';

export type ComplianceStatus =
  | 'NOT_DUE'
  | 'UPCOMING'
  | 'DOCUMENTS_PENDING'
  | 'DATA_RECEIVED'
  | 'IN_PREPARATION'
  | 'PREPARED'
  | 'READY_TO_FILE'
  | 'FILED'
  | 'VERIFIED'
  | 'OVERDUE'
  | 'LATE'
  | 'DEFECTIVE'
  | 'REVISED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface GSTComplianceFilingSummary {
  id: string;
  arn: string;
  status: string;
  actual_filing_date: string;
  acknowledgement_number: string;
  tax_liability: string;
  cash_paid: string;
  late_fee: string;
  interest: string;
  verification_date?: string | null;
}

export interface GSTCompliance {
  id: string;
  firm?: string;
  client: string;
  client_name: string;
  client_legal_name: string;
  entity: string;
  trade_name: string;
  gst_registration: string;
  gstin: string;
  return_type: GSTReturnType;
  financial_year: string;
  tax_period: string;
  statutory_due_date: string;
  status: ComplianceStatus;
  priority: PriorityLevel;
  assigned_user?: string | null;
  assigned_user_name?: string;
  notes: string;
  has_filing?: boolean;
  filing?: GSTComplianceFilingSummary | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceListParams {
  page?: number;
  page_size?: number;
  search?: string;
  client_id?: string;
  gst_registration_id?: string;
  return_type?: string;
  status?: string;
  priority?: string;
  assigned_user_id?: string;
  financial_year?: string;
  due_from?: string;
  due_to?: string;
  due_today?: boolean;
  due_this_week?: boolean;
  overdue?: boolean;
  documents_pending?: boolean;
}

export interface CreateCompliancePayload {
  gst_registration_id: string;
  return_type: GSTReturnType;
  financial_year: string;
  tax_period: string;
  statutory_due_date: string;
  status?: ComplianceStatus;
  priority?: PriorityLevel;
  assigned_user?: string | null;
  notes?: string;
}

export interface UpdateCompliancePayload {
  status?: ComplianceStatus;
  priority?: PriorityLevel;
  assigned_user?: string | null;
  notes?: string;
  statutory_due_date?: string;
}

export interface PaginatedComplianceResponse {
  items: GSTCompliance[];
  page: number;
  page_size: number;
  total: number;
}

export const ALLOWED_STATUS_TRANSITIONS: Record<ComplianceStatus, ComplianceStatus[]> = {
  NOT_DUE: ['UPCOMING', 'DOCUMENTS_PENDING', 'DATA_RECEIVED'],
  UPCOMING: ['DOCUMENTS_PENDING', 'DATA_RECEIVED', 'IN_PREPARATION', 'OVERDUE'],
  DOCUMENTS_PENDING: ['DATA_RECEIVED', 'IN_PREPARATION', 'OVERDUE'],
  DATA_RECEIVED: ['IN_PREPARATION', 'DOCUMENTS_PENDING', 'OVERDUE'],
  IN_PREPARATION: ['PREPARED', 'DOCUMENTS_PENDING', 'DATA_RECEIVED', 'OVERDUE'],
  PREPARED: ['READY_TO_FILE', 'IN_PREPARATION', 'OVERDUE'],
  READY_TO_FILE: ['FILED', 'LATE', 'PREPARED', 'IN_PREPARATION', 'OVERDUE'],
  FILED: ['VERIFIED', 'DEFECTIVE', 'REVISED', 'LATE'],
  VERIFIED: ['REVISED', 'DEFECTIVE'],
  OVERDUE: ['DOCUMENTS_PENDING', 'DATA_RECEIVED', 'IN_PREPARATION', 'PREPARED', 'READY_TO_FILE', 'FILED', 'LATE'],
  LATE: ['VERIFIED', 'DEFECTIVE', 'REVISED'],
  DEFECTIVE: ['IN_PREPARATION', 'PREPARED', 'READY_TO_FILE', 'REVISED'],
  REVISED: ['IN_PREPARATION', 'PREPARED', 'READY_TO_FILE', 'FILED'],
};
