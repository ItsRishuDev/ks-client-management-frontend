import { apiClient } from './client';
import type {
  CreateRequisitionPayload,
  Document,
  DocumentDownloadResponse,
  DocumentListParams,
  DocumentListResponse,
  DocumentRequisition,
  DocumentReviewPayload,
  RequisitionListParams,
  RequisitionListResponse,
  UpdateDocumentPayload,
  UpdateRequisitionPayload,
  UploadRequestPayload,
  UploadRequestResponse,
} from '../types/document';

export const documentsApi = {
  // Document Requisitions
  listRequisitions: async (params: RequisitionListParams = {}): Promise<RequisitionListResponse> => {
    return apiClient<RequisitionListResponse>('/document-requisitions/', {
      method: 'GET',
      params: {
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        client_id: params.client_id,
        compliance_id: params.compliance_id,
        status: params.status,
        priority: params.priority,
        document_type: params.document_type,
        assigned_user_id: params.assigned_user_id,
        due_from: params.due_from,
        due_to: params.due_to,
      },
    });
  },

  getRequisition: async (id: string): Promise<DocumentRequisition> => {
    return apiClient<DocumentRequisition>(`/document-requisitions/${id}/`, {
      method: 'GET',
    });
  },

  createRequisition: async (payload: CreateRequisitionPayload): Promise<DocumentRequisition> => {
    return apiClient<DocumentRequisition>('/document-requisitions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateRequisition: async (id: string, payload: UpdateRequisitionPayload): Promise<DocumentRequisition> => {
    return apiClient<DocumentRequisition>(`/document-requisitions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  expireRequisition: async (id: string): Promise<DocumentRequisition> => {
    return apiClient<DocumentRequisition>(`/document-requisitions/${id}/expire/`, {
      method: 'POST',
    });
  },

  // Documents
  listDocuments: async (params: DocumentListParams = {}): Promise<DocumentListResponse> => {
    return apiClient<DocumentListResponse>('/documents/', {
      method: 'GET',
      params: {
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        client_id: params.client_id,
        compliance_id: params.compliance_id,
        document_requisition_id: params.document_requisition_id,
        document_type: params.document_type,
        review_status: params.review_status,
        uploaded_by_id: params.uploaded_by_id,
      },
    });
  },

  getDocument: async (id: string): Promise<Document> => {
    return apiClient<Document>(`/documents/${id}/`, {
      method: 'GET',
    });
  },

  updateDocument: async (id: string, payload: UpdateDocumentPayload): Promise<Document> => {
    return apiClient<Document>(`/documents/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  requestUpload: async (payload: UploadRequestPayload): Promise<UploadRequestResponse> => {
    return apiClient<UploadRequestResponse>('/documents/upload-request/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  completeUpload: async (documentId: string): Promise<Document> => {
    return apiClient<Document>(`/documents/${documentId}/upload-complete/`, {
      method: 'POST',
    });
  },

  downloadDocument: async (documentId: string): Promise<DocumentDownloadResponse> => {
    return apiClient<DocumentDownloadResponse>(`/documents/${documentId}/download/`, {
      method: 'GET',
    });
  },

  reviewDocument: async (documentId: string, payload: DocumentReviewPayload): Promise<Document> => {
    return apiClient<Document>(`/documents/${documentId}/review/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
