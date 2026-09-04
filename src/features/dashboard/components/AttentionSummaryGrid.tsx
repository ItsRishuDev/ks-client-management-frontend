import React from 'react';
import { AlertCircle, Clock, CheckSquare, FileText, IndianRupee } from 'lucide-react';
import type { DashboardSummary } from '../../../types/dashboard';
import { Skeleton } from '../../../components/ui';

export interface AttentionSummaryGridProps {
  summary?: DashboardSummary;
  isLoading: boolean;
}

export const AttentionSummaryGrid: React.FC<AttentionSummaryGridProps> = ({
  summary,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="dashboard-metrics-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="metric-card">
            <Skeleton variant="text" width="60%" height={14} />
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="80%" height={12} />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val?: string) => {
    if (!val) return '₹0.00';
    const num = parseFloat(val);
    if (isNaN(num)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  };

  const overdue = summary?.overdue_compliance ?? 0;
  const dueToday = summary?.due_today ?? 0;
  const tasksDue = summary?.tasks_due_today ?? 0;
  const docsPending = summary?.documents_pending ?? 0;
  const outstanding = summary?.outstanding_invoices ?? '0.00';

  return (
    <div className="dashboard-metrics-grid">
      {/* 1. Overdue Compliance */}
      <div className={`metric-card ${overdue > 0 ? 'metric-card--alert' : ''}`}>
        <div className="metric-card-top">
          <span className="metric-card-label">Overdue Compliance</span>
          <div className="metric-card-icon-wrap" style={{ backgroundColor: '#fef2f2', color: 'var(--color-danger-text)' }}>
            <AlertCircle size={18} />
          </div>
        </div>
        <div className="metric-card-value" style={{ color: overdue > 0 ? 'var(--color-danger-text)' : undefined }}>
          {overdue}
        </div>
        <div className="metric-card-sub">
          {overdue > 0 ? 'Requires immediate action' : 'All obligations on track'}
        </div>
      </div>

      {/* 2. Compliance Due Today */}
      <div className={`metric-card ${dueToday > 0 ? 'metric-card--warning' : ''}`}>
        <div className="metric-card-top">
          <span className="metric-card-label">Due Today</span>
          <div className="metric-card-icon-wrap" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
            <Clock size={18} />
          </div>
        </div>
        <div className="metric-card-value" style={{ color: dueToday > 0 ? '#b45309' : undefined }}>
          {dueToday}
        </div>
        <div className="metric-card-sub">GST returns due today</div>
      </div>

      {/* 3. Tasks Due / Overdue */}
      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-card-label">Tasks Due</span>
          <div className="metric-card-icon-wrap" style={{ backgroundColor: '#eef2ff', color: 'var(--color-primary-600)' }}>
            <CheckSquare size={18} />
          </div>
        </div>
        <div className="metric-card-value">{tasksDue}</div>
        <div className="metric-card-sub">Tasks due today or earlier</div>
      </div>

      {/* 4. Documents Pending */}
      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-card-label">Pending Docs</span>
          <div className="metric-card-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
            <FileText size={18} />
          </div>
        </div>
        <div className="metric-card-value">{docsPending}</div>
        <div className="metric-card-sub">Requisitions pending review/upload</div>
      </div>

      {/* 5. Outstanding Receivables */}
      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-card-label">Outstanding Invoices</span>
          <div className="metric-card-icon-wrap" style={{ backgroundColor: '#f0fdf4', color: 'var(--color-success-text)' }}>
            <IndianRupee size={18} />
          </div>
        </div>
        <div className="metric-card-value" style={{ fontSize: '1.375rem' }}>
          {formatCurrency(outstanding)}
        </div>
        <div className="metric-card-sub">Unpaid firm receivables</div>
      </div>
    </div>
  );
};
