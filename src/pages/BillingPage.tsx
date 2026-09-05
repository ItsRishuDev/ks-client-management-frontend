import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { useAuth } from '../context/useAuth';
import { userHasPermission } from '../utils/permissions';
import { useClientsList } from '../features/clients/hooks/useClients';
import {
  useInvoiceList,
  usePaymentList,
  useSendInvoiceMutation,
  useCancelInvoiceMutation,
} from '../features/billing/hooks/useBilling';
import { InvoiceTable } from '../features/billing/components/InvoiceTable';
import { PaymentTable } from '../features/billing/components/PaymentTable';
import { CreateInvoiceModal } from '../features/billing/components/CreateInvoiceModal';
import { RecordPaymentModal } from '../features/billing/components/RecordPaymentModal';
import { InvoiceDetailModal } from '../features/billing/components/InvoiceDetailModal';
import { PaymentAllocationsModal } from '../features/billing/components/PaymentAllocationsModal';
import { useToast } from '../components/ui/useToast';
import {
  INVOICE_STATUS_LABELS,
  PAYMENT_MODE_LABELS,
  type Invoice,
  type InvoiceStatus,
  type Payment,
  type PaymentMode,
} from '../types/billing';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const canCreateInvoice = userHasPermission(user, 'invoices.create');
  const canRecordPayment = userHasPermission(user, 'payments.record');

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

  // Filters
  const [selectedClientId, setSelectedClientId] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [modeFilter, setModeFilter] = useState<PaymentMode | ''>('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  // Modals state
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>(undefined);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>(undefined);
  const [isAllocationsOpen, setIsAllocationsOpen] = useState(false);

  // Queries
  const { data: clientsData } = useClientsList({ page_size: 100 });
  const clients = clientsData?.items || [];

  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoiceList({
    client_id: selectedClientId || undefined,
    status: statusFilter || undefined,
    overdue: overdueOnly ? true : undefined,
    page: invoicePage,
    page_size: 25,
  });

  const { data: paymentsData, isLoading: isLoadingPayments } = usePaymentList({
    client_id: selectedClientId || undefined,
    mode: modeFilter || undefined,
    page: paymentPage,
    page_size: 25,
  });

  const sendInvoiceMutation = useSendInvoiceMutation();
  const cancelInvoiceMutation = useCancelInvoiceMutation();

  const invoices = useMemo(() => invoicesData?.items || [], [invoicesData?.items]);
  const payments = useMemo(() => paymentsData?.items || [], [paymentsData?.items]);

  // KPIs
  const kpis = useMemo(() => {
    let totalBilled = 0;
    let totalOutstanding = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    for (const inv of invoices) {
      const tot = parseFloat(inv.total_amount) || 0;
      const out = parseFloat(inv.outstanding_balance) || 0;
      totalBilled += tot;
      totalOutstanding += out;

      if (inv.due_date < todayStr && inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
        overdueCount += 1;
        overdueAmount += out;
      }
    }

    let totalCollected = 0;
    for (const pmt of payments) {
      totalCollected += parseFloat(pmt.amount) || 0;
    }

    return { totalBilled, totalOutstanding, overdueCount, overdueAmount, totalCollected };
  }, [invoices, payments]);

  const formatCurrency = (num: number) =>
    `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleViewInvoice = (inv: Invoice) => {
    setSelectedInvoiceId(inv.id);
    setIsInvoiceDetailOpen(true);
  };

  const handleSendInvoice = async (inv: Invoice) => {
    try {
      await sendInvoiceMutation.mutateAsync(inv.id);
      success(`Invoice ${inv.invoice_number} sent successfully.`);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to send invoice.');
    }
  };

  const handleCancelInvoice = async (inv: Invoice) => {
    if (!window.confirm(`Are you sure you want to cancel invoice ${inv.invoice_number}?`)) return;
    try {
      await cancelInvoiceMutation.mutateAsync(inv.id);
      success(`Invoice ${inv.invoice_number} cancelled.`);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to cancel invoice.');
    }
  };

  const handleViewAllocations = (pmt: Payment) => {
    setSelectedPayment(pmt);
    setIsAllocationsOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
            Billing & Receivables
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', marginTop: '0.25rem' }}>
            Manage client invoices, line items, and atomic FIFO payment allocations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {canRecordPayment && (
            <Button
              variant="outline"
              onClick={() => setIsRecordPaymentOpen(true)}
            >
              + Record Payment
            </Button>
          )}
          {canCreateInvoice && (
            <Button
              variant="primary"
              onClick={() => setIsCreateInvoiceOpen(true)}
            >
              + Create Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Financial KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
            Outstanding Balance
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger-600, #dc2626)', marginTop: '0.375rem' }}>
            {formatCurrency(kpis.totalOutstanding)}
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
            Total Invoiced
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-slate-900)', marginTop: '0.375rem' }}>
            {formatCurrency(kpis.totalBilled)}
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
            Total Collected
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success-600, #16a34a)', marginTop: '0.375rem' }}>
            {formatCurrency(kpis.totalCollected)}
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
            Overdue Invoices
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-warning-600, #d97706)', marginTop: '0.375rem' }}>
            {kpis.overdueCount} ({formatCurrency(kpis.overdueAmount)})
          </div>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: activeTab === 'invoices' ? 'var(--color-primary-700, #1d4ed8)' : 'var(--color-slate-600)',
                borderBottom: activeTab === 'invoices' ? '2px solid var(--color-primary-700, #1d4ed8)' : '2px solid transparent',
                paddingBottom: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Invoices ({invoicesData?.total ?? invoices.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: activeTab === 'payments' ? 'var(--color-primary-700, #1d4ed8)' : 'var(--color-slate-600)',
                borderBottom: activeTab === 'payments' ? '2px solid var(--color-primary-700, #1d4ed8)' : '2px solid transparent',
                paddingBottom: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Payments ({paymentsData?.total ?? payments.length})
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: '220px' }}>
            <Select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setInvoicePage(1);
                setPaymentPage(1);
              }}
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.client_code ? `[${c.client_code}] ` : ''}
                  {c.display_name} {c.legal_name && c.legal_name !== c.display_name ? `(${c.legal_name})` : ''}
                </option>
              ))}
            </Select>
          </div>

          {activeTab === 'invoices' && (
            <>
              <div style={{ minWidth: '160px' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as InvoiceStatus | '');
                    setInvoicePage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  {(Object.keys(INVOICE_STATUS_LABELS) as InvoiceStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {INVOICE_STATUS_LABELS[st]}
                    </option>
                  ))}
                </Select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Checkbox
                  id="overdue-filter"
                  checked={overdueOnly}
                  onChange={(e) => {
                    setOverdueOnly(e.target.checked);
                    setInvoicePage(1);
                  }}
                />
                <label htmlFor="overdue-filter" style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', cursor: 'pointer' }}>
                  Overdue only
                </label>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <div style={{ minWidth: '160px' }}>
              <Select
                value={modeFilter}
                onChange={(e) => {
                  setModeFilter(e.target.value as PaymentMode | '');
                  setPaymentPage(1);
                }}
              >
                <option value="">All Payment Modes</option>
                {(Object.keys(PAYMENT_MODE_LABELS) as PaymentMode[]).map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_MODE_LABELS[m]}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* Content Table */}
        {activeTab === 'invoices' ? (
          <>
            <InvoiceTable
              invoices={invoices}
              isLoading={isLoadingInvoices}
              onViewInvoice={handleViewInvoice}
              onSendInvoice={handleSendInvoice}
              onCancelInvoice={handleCancelInvoice}
            />
            {invoicesData && invoicesData.total > 25 && (
              <Pagination
                page={invoicePage}
                totalPages={Math.ceil(invoicesData.total / 25)}
                onPageChange={(p) => setInvoicePage(p)}
              />
            )}
          </>
        ) : (
          <>
            <PaymentTable
              payments={payments}
              isLoading={isLoadingPayments}
              onViewAllocations={handleViewAllocations}
            />
            {paymentsData && paymentsData.total > 25 && (
              <Pagination
                page={paymentPage}
                totalPages={Math.ceil(paymentsData.total / 25)}
                onPageChange={(p) => setPaymentPage(p)}
              />
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        preselectedClientId={selectedClientId || undefined}
        onClose={() => setIsCreateInvoiceOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        preselectedClientId={selectedClientId || undefined}
        onClose={() => setIsRecordPaymentOpen(false)}
      />

      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        isOpen={isInvoiceDetailOpen}
        onClose={() => {
          setIsInvoiceDetailOpen(false);
          setSelectedInvoiceId(undefined);
        }}
      />

      <PaymentAllocationsModal
        payment={selectedPayment}
        isOpen={isAllocationsOpen}
        onClose={() => {
          setIsAllocationsOpen(false);
          setSelectedPayment(undefined);
        }}
      />
    </div>
  );
};
