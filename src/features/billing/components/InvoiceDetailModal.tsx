import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { InvoiceStatusBadge } from './BillingBadges';
import { useInvoiceDetail, useSendInvoiceMutation, useCancelInvoiceMutation } from '../hooks/useBilling';
import { useToast } from '../../../components/ui/useToast';
import { useAuth } from '../../../context/useAuth';
import { userHasPermission } from '../../../utils/permissions';

export interface InvoiceDetailModalProps {
  invoiceId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoiceId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { data: invoice, isLoading } = useInvoiceDetail(invoiceId);

  const sendInvoiceMutation = useSendInvoiceMutation();
  const cancelInvoiceMutation = useCancelInvoiceMutation();

  const canManage = userHasPermission(user, 'invoices.create');

  if (!isOpen) return null;

  const formatCurrency = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '₹0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '₹0.00' : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSend = async () => {
    if (!invoiceId) return;
    try {
      await sendInvoiceMutation.mutateAsync(invoiceId);
      success('Invoice sent successfully.');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to send invoice.');
    }
  };

  const handleCancel = async () => {
    if (!invoiceId) return;
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await cancelInvoiceMutation.mutateAsync(invoiceId);
      success('Invoice cancelled successfully.');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to cancel invoice.');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={invoice ? `Invoice ${invoice.invoice_number}` : 'Invoice Details'}>
      {isLoading || !invoice ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-slate-500)' }}>
          Loading invoice details...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              backgroundColor: 'var(--color-slate-50, #f8fafc)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--color-slate-200, #e2e8f0)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                Client
              </div>
              <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>{invoice.client_name || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                Status
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                Invoice Date
              </div>
              <div style={{ fontWeight: 500 }}>{invoice.invoice_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                Due Date
              </div>
              <div style={{ fontWeight: 500 }}>{invoice.due_date}</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-slate-800)' }}>
              Line Items
            </h4>
            <div style={{ border: '1px solid var(--color-slate-200, #e2e8f0)', borderRadius: '6px', overflow: 'hidden' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>SAC/HSN</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Qty</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Unit Price</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Taxable</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Tax Rate</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Tax Amount</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item) => {
                      const cgstNum = parseFloat(String(item.cgst)) || 0;
                      const sgstNum = parseFloat(String(item.sgst)) || 0;
                      const igstNum = parseFloat(String(item.igst)) || 0;
                      const totalTax = cgstNum + sgstNum + igstNum;

                      return (
                        <TableRow key={item.id}>
                          <TableCell style={{ fontWeight: 500 }}>{item.description}</TableCell>
                          <TableCell style={{ fontFamily: 'monospace', color: 'var(--color-slate-600)' }}>
                            {item.sac_hsn || '—'}
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>{item.quantity}</TableCell>
                          <TableCell style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell style={{ textAlign: 'right' }}>{formatCurrency(item.taxable_amount)}</TableCell>
                          <TableCell style={{ textAlign: 'right' }}>{item.gst_rate}%</TableCell>
                          <TableCell style={{ textAlign: 'right' }}>{formatCurrency(totalTax)}</TableCell>
                          <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} style={{ textAlign: 'center', color: 'var(--color-slate-500)' }}>
                        No line items recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div>
              {invoice.notes && (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
                  <strong>Notes / Remarks:</strong>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
                </div>
              )}
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-slate-50, #f8fafc)',
                border: '1px solid var(--color-slate-200, #e2e8f0)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-slate-600)' }}>Subtotal:</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {parseFloat(invoice.cgst) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-slate-600)' }}>CGST:</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(invoice.cgst)}</span>
                </div>
              )}
              {parseFloat(invoice.sgst) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-slate-600)' }}>SGST:</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(invoice.sgst)}</span>
                </div>
              )}
              {parseFloat(invoice.igst) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-slate-600)' }}>IGST:</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(invoice.igst)}</span>
                </div>
              )}
              {parseFloat(invoice.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-slate-600)' }}>Discount:</span>
                  <span style={{ fontWeight: 500 }}>- {formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div
                style={{
                  borderTop: '1px solid var(--color-slate-200, #e2e8f0)',
                  paddingTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'var(--color-slate-900)',
                }}
              >
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-success-700, #15803d)' }}>
                <span>Total Paid / Allocated:</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.total_allocated)}</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--color-slate-200, #e2e8f0)',
                  paddingTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: parseFloat(invoice.outstanding_balance) > 0 ? 'var(--color-danger-600, #dc2626)' : 'var(--color-success-600, #16a34a)',
                }}
              >
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.outstanding_balance)}</span>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-slate-200)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {canManage && invoice.status === 'DRAFT' && (
                <Button
                  variant="primary"
                  onClick={handleSend}
                  disabled={sendInvoiceMutation.isPending}
                >
                  {sendInvoiceMutation.isPending ? 'Sending...' : 'Send Invoice'}
                </Button>
              )}
              {canManage && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={cancelInvoiceMutation.isPending}
                  style={{ color: 'var(--color-danger-600, #dc2626)' }}
                >
                  {cancelInvoiceMutation.isPending ? 'Cancelling...' : 'Cancel Invoice'}
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
