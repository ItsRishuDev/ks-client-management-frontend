import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { useToast } from '../../../components/ui/useToast';
import { useClientsList } from '../../clients/hooks/useClients';
import { useCreateInvoiceMutation } from '../hooks/useBilling';
import type { InvoiceItemInput } from '../../../types/billing';

export interface CreateInvoiceModalProps {
  isOpen: boolean;
  preselectedClientId?: string;
  onClose: () => void;
}

const DEFAULT_GST_RATES = [
  { value: '0.00', label: '0%' },
  { value: '5.00', label: '5%' },
  { value: '12.00', label: '12%' },
  { value: '18.00', label: '18%' },
  { value: '28.00', label: '28%' },
];

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  preselectedClientId,
  onClose,
}) => {
  const { success, error: toastError } = useToast();
  const { data: clientsData, isLoading: isLoadingClients } = useClientsList({ page_size: 100 });
  const createInvoiceMutation = useCreateInvoiceMutation();

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  };

  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [discount, setDiscount] = useState('0.00');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [items, setItems] = useState<InvoiceItemInput[]>([
    {
      description: '',
      sac_hsn: '9982',
      quantity: 1,
      unit_price: '',
      gst_rate: '18.00',
    },
  ]);

  const clients = clientsData?.items || [];

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        sac_hsn: '9982',
        quantity: 1,
        unit_price: '',
        gst_rate: '18.00',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemInput, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Preview calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    for (const item of items) {
      const qty = parseFloat(String(item.quantity)) || 0;
      const price = parseFloat(String(item.unit_price)) || 0;
      const rate = parseFloat(String(item.gst_rate)) || 0;
      const lineTaxable = qty * price;
      const lineTax = lineTaxable * (rate / 100);
      subtotal += lineTaxable;
      taxTotal += lineTax;
    }
    const discountNum = parseFloat(discount) || 0;
    const grandTotal = Math.max(0, subtotal + taxTotal - discountNum);
    return { subtotal, taxTotal, grandTotal };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMsg('Please select a client.');
      return;
    }

    if (new Date(dueDate) < new Date(invoiceDate)) {
      setErrorMsg('Due date cannot be earlier than invoice date.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description.trim()) {
        setErrorMsg(`Item #${i + 1} requires a description.`);
        return;
      }
      const price = parseFloat(String(item.unit_price));
      if (isNaN(price) || price <= 0) {
        setErrorMsg(`Item #${i + 1} requires a valid positive unit price.`);
        return;
      }
      const qty = parseFloat(String(item.quantity));
      if (isNaN(qty) || qty <= 0) {
        setErrorMsg(`Item #${i + 1} requires a quantity greater than zero.`);
        return;
      }
    }

    setErrorMsg('');

    try {
      await createInvoiceMutation.mutateAsync({
        client_id: clientId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        discount: parseFloat(discount) || 0,
        notes: notes.trim() || undefined,
        items: items.map((it) => ({
          description: it.description.trim(),
          sac_hsn: it.sac_hsn?.trim() || undefined,
          quantity: parseFloat(String(it.quantity)) || 1,
          unit_price: parseFloat(String(it.unit_price)) || 0,
          gst_rate: parseFloat(String(it.gst_rate)) || 18,
        })),
      });

      success('Invoice created as Draft successfully.');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create invoice.';
      setErrorMsg(msg);
      toastError(msg);
    }
  };

  const formatCurrency = (num: number) =>
    `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Invoice">
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Invoice Date *
              </label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Due Date *
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Line Items Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
              Line Items
            </h4>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              + Add Item
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item, idx) => {
              const qty = parseFloat(String(item.quantity)) || 0;
              const price = parseFloat(String(item.unit_price)) || 0;
              const rate = parseFloat(String(item.gst_rate)) || 0;
              const lineTotal = qty * price * (1 + rate / 100);

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-slate-50, #f8fafc)',
                    border: '1px solid var(--color-slate-200, #e2e8f0)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    display: 'grid',
                    gridTemplateColumns: '3fr 1fr 1fr 1.5fr 1.2fr 1.5fr auto',
                    gap: '0.5rem',
                    alignItems: 'end',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-slate-600)', marginBottom: '0.25rem' }}>
                      Description *
                    </label>
                    <Input
                      placeholder="e.g. GST Filing Services"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-slate-600)', marginBottom: '0.25rem' }}>
                      SAC/HSN
                    </label>
                    <Input
                      placeholder="9982"
                      value={item.sac_hsn}
                      onChange={(e) => handleItemChange(idx, 'sac_hsn', e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-slate-600)', marginBottom: '0.25rem' }}>
                      Qty *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-slate-600)', marginBottom: '0.25rem' }}>
                      Rate (₹) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="2000.00"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-slate-600)', marginBottom: '0.25rem' }}>
                      GST Rate
                    </label>
                    <Select
                      value={String(item.gst_rate)}
                      onChange={(e) => handleItemChange(idx, 'gst_rate', e.target.value)}
                    >
                      {DEFAULT_GST_RATES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-slate-600)', marginBottom: '0.25rem' }}>
                      Total
                    </label>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 0' }}>
                      {formatCurrency(lineTotal)}
                    </div>
                  </div>

                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      style={{ color: 'var(--color-danger-600, #dc2626)' }}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary & Discount / Notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Discount (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Notes / Terms
              </label>
              <Textarea
                rows={2}
                placeholder="Payment terms, bank details, or additional remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
              <span>Estimated GST:</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(totals.taxTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
              <span>Discount:</span>
              <span style={{ fontWeight: 500 }}>- {formatCurrency(parseFloat(discount) || 0)}</span>
            </div>
            <div
              style={{
                borderTop: '1px solid var(--color-slate-200, #e2e8f0)',
                paddingTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--color-primary-800, #1e3a8a)',
              }}
            >
              <span>Estimated Total:</span>
              <span>{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={createInvoiceMutation.isPending}>
            {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice (Draft)'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
