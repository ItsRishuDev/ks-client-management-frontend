export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMode = 'UPI' | 'NEFT' | 'RTGS' | 'NET_BANKING' | 'CHEQUE' | 'CASH' | 'OTHER';

export interface InvoiceItem {
  id: string;
  service_id: string | null;
  description: string;
  sac_hsn: string;
  quantity: string | number;
  unit_price: string | number;
  taxable_amount: string | number;
  gst_rate: string | number;
  cgst: string | number;
  sgst: string | number;
  igst: string | number;
  total: string | number;
  created_at: string;
}

export interface InvoiceItemInput {
  service_id?: string | null;
  description: string;
  sac_hsn?: string;
  quantity: number | string;
  unit_price: number | string;
  gst_rate: number | string;
}

export interface Invoice {
  id: string;
  firm: string;
  client: string;
  client_name?: string;
  entity: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: string;
  discount: string;
  taxable_amount: string;
  cgst: string;
  sgst: string;
  igst: string;
  total_amount: string;
  total_allocated: string;
  outstanding_balance: string;
  notes: string;
  items: InvoiceItem[];
  created_by: string | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentAllocation {
  id: string;
  firm: string;
  payment: string;
  invoice: string;
  invoice_number?: string;
  allocated_amount: string;
  allocation_date: string;
  created_at: string;
}

export interface Payment {
  id: string;
  firm: string;
  client: string;
  client_name?: string;
  payment_date: string;
  amount: string;
  payment_mode: PaymentMode;
  transaction_reference: string;
  notes: string;
  total_allocated: string;
  unallocated_amount: string;
  allocations: PaymentAllocation[];
  recorded_by: string | null;
  recorded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceListParams {
  client_id?: string;
  status?: InvoiceStatus | '';
  due_from?: string;
  due_to?: string;
  overdue?: boolean | string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface InvoiceListResponse {
  items: Invoice[];
  page: number;
  page_size: number;
  total: number;
}

export interface PaymentListParams {
  client_id?: string;
  date_from?: string;
  date_to?: string;
  mode?: PaymentMode | '';
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaymentListResponse {
  items: Payment[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateInvoicePayload {
  client_id: string;
  entity_id?: string | null;
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  discount?: number | string;
  notes?: string;
  items: InvoiceItemInput[];
}

export interface UpdateInvoicePayload {
  due_date?: string;
  notes?: string;
}

export interface RecordPaymentPayload {
  client_id: string;
  amount: number | string;
  payment_date?: string;
  payment_mode: PaymentMode;
  transaction_reference?: string;
  notes?: string;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

export const INVOICE_STATUS_BADGE_VARIANTS: Record<
  InvoiceStatus,
  'neutral' | 'primary' | 'warning' | 'success' | 'danger'
> = {
  DRAFT: 'neutral',
  SENT: 'primary',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  UPI: 'UPI',
  NEFT: 'NEFT',
  RTGS: 'RTGS',
  NET_BANKING: 'Net Banking',
  CHEQUE: 'Cheque',
  CASH: 'Cash',
  OTHER: 'Other',
};
