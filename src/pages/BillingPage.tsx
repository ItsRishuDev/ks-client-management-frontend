import React from 'react'

export const BillingPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid var(--color-slate-200)',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
        Billing & Receivables
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
        Invoices, line items, FIFO payment allocations and balance collections.
      </p>
    </div>
  )
}
