import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { InvoiceStatusBadge } from './BillingBadges';
import type { Invoice } from '../../../types/billing';
import { useAuth } from '../../../context/useAuth';
import { userHasPermission } from '../../../utils/permissions';

export interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onViewInvoice: (invoice: Invoice) => void;
  onSendInvoice: (invoice: Invoice) => void;
  onCancelInvoice: (invoice: Invoice) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  onViewInvoice,
  onSendInvoice,
  onCancelInvoice,
}) => {
  const { user } = useAuth();
  const canManageInvoices = userHasPermission(user, 'invoices.create');

  if (!isLoading && invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices found"
        description="No invoices match the selected criteria or no invoices have been created yet."
      />
    );
  }

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '₹0.00' : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Total Amount</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Balance Due</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => {
            const isDraft = inv.status === 'DRAFT';
            const isCancellable = inv.status !== 'PAID' && inv.status !== 'CANCELLED';

            return (
              <TableRow key={inv.id}>
                <TableCell style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>
                  {inv.invoice_number}
                </TableCell>
                <TableCell>
                  <div style={{ fontWeight: 500 }}>{inv.client_name || '—'}</div>
                </TableCell>
                <TableCell>{inv.invoice_date}</TableCell>
                <TableCell>{inv.due_date}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={inv.status} />
                </TableCell>
                <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(inv.total_amount)}
                </TableCell>
                <TableCell
                  style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    color: parseFloat(inv.outstanding_balance) > 0 ? 'var(--color-danger-600, #dc2626)' : 'var(--color-success-600, #16a34a)',
                  }}
                >
                  {formatCurrency(inv.outstanding_balance)}
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewInvoice(inv)}
                    >
                      View
                    </Button>
                    {canManageInvoices && isDraft && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSendInvoice(inv)}
                      >
                        Send
                      </Button>
                    )}
                    {canManageInvoices && isCancellable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelInvoice(inv)}
                        style={{ color: 'var(--color-danger-600, #dc2626)' }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
