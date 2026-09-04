import React from 'react'

export const CompliancePage: React.FC = () => {
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
        GST Compliance
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
        Periodic compliance obligations (GSTR-1, GSTR-3B) and lifecycle progression.
      </p>
    </div>
  )
}
