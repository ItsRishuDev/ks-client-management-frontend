import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { useToast } from '../../../components/ui/useToast';
import { useClientsList } from '../../clients/hooks/useClients';
import { useRecordPaymentMutation } from '../hooks/useBilling';
import { PAYMENT_MODE_LABELS, type PaymentMode } from '../../../types/billing';

export interface RecordPaymentModalProps {
  isOpen: boolean;
  preselectedClientId?: string;
  onClose: () => void;
}

const PAYMENT_MODES: PaymentMode[] = [
  'UPI',
  'NEFT',
  'RTGS',
  'NET_BANKING',
  'CHEQUE',
  'CASH',
  'OTHER',
];

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  preselectedClientId,
  onClose,
}) => {
  const { success, error: toastError } = useToast();
  const { data: clientsData, isLoading: isLoadingClients } = useClientsList({ page_size: 100 });
  const recordPaymentMutation = useRecordPaymentMutation();

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayDate());
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const clients = clientsData?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMsg('Please select a client.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than zero.');
      return;
    }

    setErrorMsg('');

    try {
      await recordPaymentMutation.mutateAsync({
        client_id: clientId,
        amount: numAmount,
        payment_date: paymentDate,
        payment_mode: paymentMode,
        transaction_reference: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      success('Payment recorded and allocated successfully via FIFO.');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record payment.';
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Record Payment & Allocate">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-50, #fef2f2)',
              color: 'var(--color-danger-700, #b91c1c)',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              border: '1px solid var(--color-danger-200, #fecaca)',
            }}
          >
            {errorMsg}
          </div>
        )}

        <div
          style={{
            backgroundColor: 'var(--color-primary-50, #eff6ff)',
            border: '1px solid var(--color-primary-200, #bfdbfe)',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            fontSize: '0.8125rem',
            color: 'var(--color-primary-800, #1e40af)',
            lineHeight: 1.4,
          }}
        >
          <strong>FIFO Payment Allocation:</strong> Incoming payments automatically settle the client's oldest outstanding invoices in chronological sequence. Any excess amount is preserved as an unallocated credit balance.
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Client *
          </label>
          <Select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={isLoadingClients}
            required
          >
            <option value="">-- Select Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.client_code ? `[${c.client_code}] ` : ''}
                {c.display_name} {c.legal_name && c.legal_name !== c.display_name ? `(${c.legal_name})` : ''}
              </option>
            ))}
          </Select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Amount (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 15000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Payment Date *
            </label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Payment Mode *
            </label>
            <Select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              required
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {PAYMENT_MODE_LABELS[mode]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Transaction Reference / UTR / Cheque #
            </label>
            <Input
              placeholder="e.g. UTR12345678"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Notes / Remarks
          </label>
          <Textarea
            rows={2}
            placeholder="Additional notes about payment origin or receipt..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={recordPaymentMutation.isPending}>
            {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
