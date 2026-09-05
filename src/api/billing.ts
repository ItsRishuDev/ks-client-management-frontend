import { apiClient } from './client';
import type {
  CreateInvoicePayload,
  Invoice,
  InvoiceListParams,
  InvoiceListResponse,
  Payment,
  PaymentAllocation,
  PaymentListParams,
  PaymentListResponse,
  RecordPaymentPayload,
  UpdateInvoicePayload,
} from '../types/billing';

export const invoicesApi = {
  list: async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
    return apiClient<InvoiceListResponse>('/invoices/', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  get: async (invoiceId: string): Promise<Invoice> => {
    return apiClient<Invoice>(`/invoices/${invoiceId}/`, {
      method: 'GET',
    });
  },

  create: async (payload: CreateInvoicePayload): Promise<Invoice> => {
    return apiClient<Invoice>('/invoices/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: async (invoiceId: string, payload: UpdateInvoicePayload): Promise<Invoice> => {
    return apiClient<Invoice>(`/invoices/${invoiceId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  send: async (invoiceId: string): Promise<Invoice> => {
    return apiClient<Invoice>(`/invoices/${invoiceId}/send/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  cancel: async (invoiceId: string): Promise<Invoice> => {
    return apiClient<Invoice>(`/invoices/${invoiceId}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};

export const paymentsApi = {
  list: async (params?: PaymentListParams): Promise<PaymentListResponse> => {
    return apiClient<PaymentListResponse>('/payments/', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  get: async (paymentId: string): Promise<Payment> => {
    return apiClient<Payment>(`/payments/${paymentId}/`, {
      method: 'GET',
    });
  },

  record: async (payload: RecordPaymentPayload): Promise<Payment> => {
    return apiClient<Payment>('/payments/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAllocations: async (paymentId: string): Promise<PaymentAllocation[]> => {
    return apiClient<PaymentAllocation[]>(`/payments/${paymentId}/allocations/`, {
      method: 'GET',
    });
  },
};
