import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, paymentsApi } from '../../../api/billing';
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
} from '../../../types/billing';
import { DASHBOARD_QUERY_KEYS } from '../../dashboard/hooks/useDashboard';

export const BILLING_QUERY_KEYS = {
  all: ['billing'] as const,
  invoices: () => [...BILLING_QUERY_KEYS.all, 'invoices'] as const,
  invoiceLists: () => [...BILLING_QUERY_KEYS.invoices(), 'list'] as const,
  invoiceList: (params: InvoiceListParams) => [...BILLING_QUERY_KEYS.invoiceLists(), params] as const,
  invoiceDetails: () => [...BILLING_QUERY_KEYS.invoices(), 'detail'] as const,
  invoiceDetail: (id: string) => [...BILLING_QUERY_KEYS.invoiceDetails(), id] as const,
  payments: () => [...BILLING_QUERY_KEYS.all, 'payments'] as const,
  paymentLists: () => [...BILLING_QUERY_KEYS.payments(), 'list'] as const,
  paymentList: (params: PaymentListParams) => [...BILLING_QUERY_KEYS.paymentLists(), params] as const,
  paymentDetails: () => [...BILLING_QUERY_KEYS.payments(), 'detail'] as const,
  paymentDetail: (id: string) => [...BILLING_QUERY_KEYS.paymentDetails(), id] as const,
  paymentAllocations: (paymentId: string) => [...BILLING_QUERY_KEYS.payments(), paymentId, 'allocations'] as const,
};

export const useInvoiceList = (params: InvoiceListParams = {}) => {
  return useQuery<InvoiceListResponse, Error>({
    queryKey: BILLING_QUERY_KEYS.invoiceList(params),
    queryFn: () => invoicesApi.list(params),
  });
};

export const useInvoiceDetail = (id: string | undefined) => {
  return useQuery<Invoice, Error>({
    queryKey: BILLING_QUERY_KEYS.invoiceDetail(id || ''),
    queryFn: () => invoicesApi.get(id!),
    enabled: Boolean(id),
  });
};

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Invoice, Error, CreateInvoicePayload>({
    mutationFn: (payload) => invoicesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.invoices() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};

export const useUpdateInvoiceMutation = (invoiceId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Invoice, Error, UpdateInvoicePayload>({
    mutationFn: (payload) => invoicesApi.update(invoiceId, payload),
    onSuccess: (updatedInvoice) => {
      queryClient.setQueryData(BILLING_QUERY_KEYS.invoiceDetail(invoiceId), updatedInvoice);
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.invoiceLists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};

export const useSendInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Invoice, Error, string>({
    mutationFn: (invoiceId) => invoicesApi.send(invoiceId),
    onSuccess: (updatedInvoice) => {
      queryClient.setQueryData(BILLING_QUERY_KEYS.invoiceDetail(updatedInvoice.id), updatedInvoice);
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.invoiceLists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};

export const useCancelInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Invoice, Error, string>({
    mutationFn: (invoiceId) => invoicesApi.cancel(invoiceId),
    onSuccess: (updatedInvoice) => {
      queryClient.setQueryData(BILLING_QUERY_KEYS.invoiceDetail(updatedInvoice.id), updatedInvoice);
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.invoiceLists() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};

export const usePaymentList = (params: PaymentListParams = {}) => {
  return useQuery<PaymentListResponse, Error>({
    queryKey: BILLING_QUERY_KEYS.paymentList(params),
    queryFn: () => paymentsApi.list(params),
  });
};

export const usePaymentDetail = (id: string | undefined) => {
  return useQuery<Payment, Error>({
    queryKey: BILLING_QUERY_KEYS.paymentDetail(id || ''),
    queryFn: () => paymentsApi.get(id!),
    enabled: Boolean(id),
  });
};

export const usePaymentAllocations = (paymentId: string | undefined) => {
  return useQuery<PaymentAllocation[], Error>({
    queryKey: BILLING_QUERY_KEYS.paymentAllocations(paymentId || ''),
    queryFn: () => paymentsApi.getAllocations(paymentId!),
    enabled: Boolean(paymentId),
  });
};

export const useRecordPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Payment, Error, RecordPaymentPayload>({
    mutationFn: (payload) => paymentsApi.record(payload),
    onSuccess: () => {
      // Invalidate both payments and invoices since FIFO allocation modifies invoice balances and statuses
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
  });
};
