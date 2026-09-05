export type DocumentType =
  | 'SALES_REGISTER'
  | 'PURCHASE_REGISTER'
  | 'BANK_STATEMENT'
  | 'GST_INVOICE'
  | 'FORM_16'
  | 'AIS_TIS'
  | 'BOOKS_OF_ACCOUNTS'
  | 'CHALLAN'
  | 'PAN_CARD'
  | 'AADHAAR_CARD'
  | 'OTHER';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  SALES_REGISTER: 'Sales Register',
  PURCHASE_REGISTER: 'Purchase Register',
  BANK_STATEMENT: 'Bank Statement',
  GST_INVOICE: 'GST Invoice',
  FORM_16: 'Form 16',
  AIS_TIS: 'AIS / TIS',
  BOOKS_OF_ACCOUNTS: 'Books of Accounts',
  CHALLAN: 'Challan',
  PAN_CARD: 'PAN Card',
  AADHAAR_CARD: 'Aadhaar Card',
  OTHER: 'Other Document',
};

export type RequisitionStatus =
  | 'REQUESTED'
  | 'PENDING'
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export const REQUISITION_STATUS_LABELS: Record<RequisitionStatus, string> = {
  REQUESTED: 'Requested',
  PENDING: 'Pending Client',
  RECEIVED: 'Received',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
};

export type DocumentReviewStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED';

export const REVIEW_STATUS_LABELS: Record<DocumentReviewStatus, string> = {
  PENDING: 'Pending Review',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const ALLOWED_REQUISITION_TRANSITIONS: Record<RequisitionStatus, RequisitionStatus[]> = {
  REQUESTED: ['PENDING', 'RECEIVED', 'EXPIRED'],
  PENDING: ['RECEIVED', 'EXPIRED'],
  RECEIVED: ['UNDER_REVIEW', 'ACCEPTED', 'REJECTED'],
  UNDER_REVIEW: ['ACCEPTED', 'REJECTED'],
  REJECTED: ['REQUESTED', 'PENDING', 'RECEIVED'],
  ACCEPTED: [],
  EXPIRED: ['REQUESTED'],
};

export interface DocumentRequisition {
  id: string;
  firm: string;
  client: string;
  client_name: string;
  client_code: string;
  entity?: string | null;
  gst_registration?: string | null;
  gstin?: string;
  compliance?: string | null;
  compliance_label?: string;
  document_type: DocumentType;
  description: string;
  due_date: string | null;
  priority: PriorityLevel;
  status: RequisitionStatus;
  assigned_user: string | null;
  assigned_user_name: string;
  received_date: string | null;
  notes: string;
  fulfilled_documents_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  firm: string;
  client: string;
  client_name: string;
  client_code: string;
  entity?: string | null;
  gst_registration?: string | null;
  gstin?: string;
  compliance?: string | null;
  compliance_label?: string;
  document_requisition?: string | null;
  requisition_description?: string;
  document_type: DocumentType;
  file_name: string;
  storage_key: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string | null;
  uploaded_by_name: string;
  uploaded_at: string;
  review_status: DocumentReviewStatus;
  reviewed_by: string | null;
  reviewed_by_name: string;
  reviewed_at: string | null;
  review_notes: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RequisitionListParams {
  page?: number;
  page_size?: number;
  search?: string;
  client_id?: string;
  compliance_id?: string;
  status?: string;
  priority?: string;
  document_type?: string;
  assigned_user_id?: string;
  due_from?: string;
  due_to?: string;
}

export interface DocumentListParams {
  page?: number;
  page_size?: number;
  search?: string;
  client_id?: string;
  compliance_id?: string;
  document_requisition_id?: string;
  document_type?: string;
  review_status?: string;
  uploaded_by_id?: string;
}

export interface RequisitionListResponse {
  items: DocumentRequisition[];
  page: number;
  page_size: number;
  total: number;
}

export interface DocumentListResponse {
  items: Document[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateRequisitionPayload {
  client_id: string;
  entity_id?: string | null;
  gst_registration_id?: string | null;
  compliance_id?: string | null;
  assigned_user_id?: string | null;
  document_type: DocumentType;
  description?: string;
  due_date?: string | null;
  priority?: PriorityLevel;
  notes?: string;
}

export interface UpdateRequisitionPayload {
  document_type?: DocumentType;
  description?: string;
  due_date?: string | null;
  priority?: PriorityLevel;
  status?: RequisitionStatus;
  assigned_user_id?: string | null;
  notes?: string;
}

export interface UploadRequestPayload {
  client_id: string;
  entity_id?: string | null;
  gst_registration_id?: string | null;
  compliance_id?: string | null;
  document_requisition_id?: string | null;
  document_type: DocumentType;
  file_name: string;
  mime_type: string;
  file_size: number;
}

export interface UploadRequestResponse {
  document_id: string;
  upload_url: string;
  storage_key: string;
  expires_at: string;
}

export interface DocumentReviewPayload {
  status: DocumentReviewStatus;
  notes?: string;
}

export interface DocumentDownloadResponse {
  document_id: string;
  file_name: string;
  download_url: string;
}

export interface UpdateDocumentPayload {
  document_type?: DocumentType;
  review_notes?: string;
  metadata?: Record<string, unknown>;
}
