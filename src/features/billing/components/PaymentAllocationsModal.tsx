import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { usePaymentAllocations } from '../hooks/useBilling';
import type { Payment } from '../../../types/billing';

export interface PaymentAllocationsModalProps {
  payment?: Payment;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentAllocationsModal: React.FC<PaymentAllocationsModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const { data: allocations = [], isLoading } = usePaymentAllocations(payment?.id);

  if (!isOpen) return null;

  const formatCurrency = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '₹0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '₹0.00' : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={payment ? `Payment Allocations — ${formatCurrency(payment.amount)}` : 'Payment Allocations'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {payment && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              backgroundColor: 'var(--color-slate-50, #f8fafc)',
              padding: '0.875rem',
              borderRadius: '6px',
              border: '1px solid var(--color-slate-200, #e2e8f0)',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-slate-500)' }}>Client: </span>
              <strong>{payment.client_name || '—'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-slate-500)' }}>Total Paid: </span>
              <strong style={{ color: 'var(--color-success-700)' }}>{formatCurrency(payment.amount)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-slate-500)' }}>Unallocated: </span>
              <strong>{formatCurrency(payment.unallocated_amount)}</strong>
            </div>
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-slate-500)' }}>
            Loading allocations...
          </div>
        ) : allocations.length === 0 ? (
          <EmptyState
            title="No invoice allocations"
            description="This payment has not settled any invoices yet. It remains as an unallocated credit balance."
          />
        ) : (
          <div style={{ border: '1px solid var(--color-slate-200, #e2e8f0)', borderRadius: '6px', overflow: 'hidden' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Allocation Date</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Allocated Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((alloc) => (
                  <TableRow key={alloc.id}>
                    <TableCell style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>
                      {alloc.invoice_number || alloc.invoice}
                    </TableCell>
                    <TableCell>{alloc.allocation_date}</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(alloc.allocated_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
