import React from 'react';
import { Users, AlertCircle } from 'lucide-react';
import type { StaffWorkloadItem } from '../../../types/dashboard';
import { Skeleton, Avatar, Badge, EmptyState } from '../../../components/ui';

export interface StaffWorkloadSectionProps {
  workload?: StaffWorkloadItem[];
  isLoading: boolean;
}

export const StaffWorkloadSection: React.FC<StaffWorkloadSectionProps> = ({
  workload,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="dashboard-section-card">
        <div className="dashboard-section-header">
          <div className="dashboard-section-title">
            <Users size={18} style={{ color: 'var(--color-primary-600)' }} />
            <span>Team Workload Distribution</span>
          </div>
        </div>
        <div className="dashboard-section-body">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ padding: '0.75rem 0' }}>
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="rectangular" width="100%" height={8} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = workload || [];

  return (
    <div className="dashboard-section-card">
      <div className="dashboard-section-header">
        <div className="dashboard-section-title">
          <Users size={18} style={{ color: 'var(--color-primary-600)' }} />
          <span>Team Workload Distribution</span>
        </div>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
          {items.length} Active Members
        </span>
      </div>

      <div className="dashboard-section-body">
        {items.length === 0 ? (
          <EmptyState
            title="No Staff Assigned"
            description="No active staff members found in the current firm."
          />
        ) : (
          <div>
            {items.map((item) => {
              const maxUnits = Math.max(item.total_workload, 1);
              const taskPct = (item.active_tasks / maxUnits) * 100;
              const compPct = (item.assigned_compliance / maxUnits) * 100;
              const docPct = (item.pending_documents / maxUnits) * 100;

              return (
                <div key={item.user_id} className="workload-item">
                  <div className="workload-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Avatar name={item.user_name} size="xs" />
                      <span className="workload-user-name">{item.user_name}</span>
                      <Badge variant="neutral" size="sm">{item.role}</Badge>
                    </div>
                    <div className="workload-stats">
                      {item.overdue_tasks > 0 && (
                        <span style={{ color: 'var(--color-danger-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <AlertCircle size={12} /> {item.overdue_tasks} overdue
                        </span>
                      )}
                      <span><strong>{item.total_workload}</strong> active items</span>
                    </div>
                  </div>

                  {/* Progress segment bar */}
                  {item.total_workload > 0 ? (
                    <div className="workload-bar-bg" title={`Tasks: ${item.active_tasks}, Compliance: ${item.assigned_compliance}, Docs: ${item.pending_documents}`}>
                      <div className="workload-bar-tasks" style={{ width: `${taskPct}%` }} />
                      <div className="workload-bar-compliance" style={{ width: `${compPct}%` }} />
                      <div className="workload-bar-docs" style={{ width: `${docPct}%` }} />
                    </div>
                  ) : (
                    <div className="workload-bar-bg" />
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.6875rem', color: 'var(--color-slate-500)', marginTop: '0.125rem' }}>
                    <span>Tasks: {item.active_tasks}</span>
                    <span>•</span>
                    <span>GST: {item.assigned_compliance}</span>
                    <span>•</span>
                    <span>Docs: {item.pending_documents}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
