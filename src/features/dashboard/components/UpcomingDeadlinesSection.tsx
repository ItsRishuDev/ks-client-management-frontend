import React from 'react';
import { Calendar } from 'lucide-react';
import type { UpcomingDeadlinesResponse } from '../../../types/dashboard';
import { Badge, Skeleton, EmptyState } from '../../../components/ui';

export interface UpcomingDeadlinesSectionProps {
  data?: UpcomingDeadlinesResponse;
  isLoading: boolean;
  selectedDays: number;
  onSelectDays: (days: number) => void;
}

export const UpcomingDeadlinesSection: React.FC<UpcomingDeadlinesSectionProps> = ({
  data,
  isLoading,
  selectedDays,
  onSelectDays,
}) => {
  const compliance = data?.compliance || [];
  const tasks = data?.tasks || [];
  const documents = data?.documents || [];

  const totalItems = compliance.length + tasks.length + documents.length;

  return (
    <div className="dashboard-section-card">
      <div className="dashboard-section-header">
        <div className="dashboard-section-title">
          <Calendar size={18} style={{ color: 'var(--color-primary-600)' }} />
          <span>Upcoming Deadlines</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[7, 15, 30].map((d) => (
            <button
              key={d}
              type="button"
              className={`work-queue-tab-btn ${selectedDays === d ? 'work-queue-tab-btn--active' : ''}`}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              onClick={() => onSelectDays(d)}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-section-body">
        {isLoading ? (
          <div>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ padding: '0.75rem 0' }}>
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" height={12} />
              </div>
            ))}
          </div>
        ) : totalItems === 0 ? (
          <EmptyState
            title="No Deadlines Due"
            description={`No statutory compliance, tasks, or document requisitions due within the next ${selectedDays} days.`}
          />
        ) : (
          <div>
            {/* Compliance Deadlines */}
            {compliance.map((c) => (
              <div key={`comp-${c.id}`} className="deadline-item">
                <div className="deadline-item-info">
                  <span className="deadline-item-title">
                    {c.return_type} ({c.tax_period})
                  </span>
                  <span className="deadline-item-sub">
                    {c.client_name} • Due: <strong>{c.due_date}</strong>
                  </span>
                </div>
                <Badge variant="warning" size="sm">
                  {c.status}
                </Badge>
              </div>
            ))}

            {/* Task Deadlines */}
            {tasks.map((t) => (
              <div key={`task-${t.id}`} className="deadline-item">
                <div className="deadline-item-info">
                  <span className="deadline-item-title">{t.title}</span>
                  <span className="deadline-item-sub">
                    {t.client_name || 'General Task'} • Due: <strong>{t.due_date}</strong>
                  </span>
                </div>
                <Badge variant="info" size="sm">
                  Task
                </Badge>
              </div>
            ))}

            {/* Document Deadlines */}
            {documents.map((d) => (
              <div key={`doc-${d.id}`} className="deadline-item">
                <div className="deadline-item-info">
                  <span className="deadline-item-title">{d.document_type}</span>
                  <span className="deadline-item-sub">
                    {d.client_name} • Due: <strong>{d.due_date}</strong>
                  </span>
                </div>
                <Badge variant="purple" size="sm">
                  Doc Requisition
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
