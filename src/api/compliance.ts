import { apiClient } from './client';
import type {
  ComplianceListParams,
  CreateCompliancePayload,
  GSTCompliance,
  PaginatedComplianceResponse,
  UpdateCompliancePayload,
} from '../types/compliance';

export const complianceApi = {
  list: async (params: ComplianceListParams = {}): Promise<PaginatedComplianceResponse> => {
    return apiClient<PaginatedComplianceResponse>('/compliance/', {
      method: 'GET',
      params: {
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        client_id: params.client_id,
        gst_registration_id: params.gst_registration_id,
        return_type: params.return_type,
        status: params.status,
        priority: params.priority,
        assigned_user_id: params.assigned_user_id,
        financial_year: params.financial_year,
        due_from: params.due_from,
        due_to: params.due_to,
        due_today: params.due_today ? true : undefined,
        due_this_week: params.due_this_week ? true : undefined,
        overdue: params.overdue ? true : undefined,
        documents_pending: params.documents_pending ? true : undefined,
      },
    });
  },

  get: async (id: string): Promise<GSTCompliance> => {
    return apiClient<GSTCompliance>(`/compliance/${id}/`, {
      method: 'GET',
    });
  },

  create: async (payload: CreateCompliancePayload): Promise<GSTCompliance> => {
    return apiClient<GSTCompliance>('/compliance/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: UpdateCompliancePayload): Promise<GSTCompliance> => {
    return apiClient<GSTCompliance>(`/compliance/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getFiling: async (id: string): Promise<Record<string, unknown>> => {
    return apiClient<Record<string, unknown>>(`/compliance/${id}/filing/`, {
      method: 'GET',
    });
  },
};
