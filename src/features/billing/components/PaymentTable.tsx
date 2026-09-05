import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PaymentModeBadge } from './BillingBadges';
import type { Payment } from '../../../types/billing';

export interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  onViewAllocations: (payment: Payment) => void;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  isLoading,
  onViewAllocations,
}) => {
  if (!isLoading && payments.length === 0) {
    return (
      <EmptyState
        title="No payments recorded"
        description="No payments match the selected criteria or no payments have been recorded yet."
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
            <TableHead>Payment Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Reference #</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Amount</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Allocated</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Unallocated</TableHead>
            <TableHead>Recorded By</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((pmt) => {
            const unallocatedNum = parseFloat(pmt.unallocated_amount || '0');

            return (
              <TableRow key={pmt.id}>
                <TableCell style={{ fontWeight: 500 }}>{pmt.payment_date}</TableCell>
                <TableCell>
                  <div style={{ fontWeight: 500 }}>{pmt.client_name || '—'}</div>
                </TableCell>
                <TableCell>
                  <PaymentModeBadge mode={pmt.payment_mode} />
                </TableCell>
                <TableCell style={{ color: 'var(--color-slate-600)', fontFamily: 'monospace' }}>
                  {pmt.transaction_reference || '—'}
                </TableCell>
                <TableCell style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success-700, #15803d)' }}>
                  {formatCurrency(pmt.amount)}
                </TableCell>
                <TableCell style={{ textAlign: 'right', fontWeight: 500 }}>
                  {formatCurrency(pmt.total_allocated)}
                </TableCell>
                <TableCell
                  style={{
                    textAlign: 'right',
                    fontWeight: 500,
                    color: unallocatedNum > 0 ? 'var(--color-warning-700, #b45309)' : 'var(--color-slate-500)',
                  }}
                >
                  {formatCurrency(pmt.unallocated_amount)}
                </TableCell>
                <TableCell style={{ fontSize: '0.8125rem', color: 'var(--color-slate-600)' }}>
                  {pmt.recorded_by_name || 'System'}
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewAllocations(pmt)}
                  >
                    Allocations ({pmt.allocations?.length || 0})
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
