import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  User as UserIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type {
  GSTCompliance,
  ComplianceStatus,
  UpdateCompliancePayload,
} from '../../../types/compliance';
import { ALLOWED_STATUS_TRANSITIONS } from '../../../types/compliance';
import type { FirmUserOption } from '../../../types/client';
import {
  Button,
  Badge,
} from '../../../components/ui';
import {
  renderComplianceStatusBadge,
  renderPriorityBadge,
} from './complianceBadges';
import { ComplianceStatusModal } from './ComplianceStatusModal';

export interface ComplianceDetailViewProps {
  compliance: GSTCompliance;
  onBack: () => void;
  onUpdateStatus: (complianceId: string, payload: UpdateCompliancePayload) => Promise<void>;
  users: FirmUserOption[];
  canUpdate: boolean;
  isUpdating: boolean;
}

const LIFECYCLE_STAGES: ComplianceStatus[] = [
  'NOT_DUE',
  'UPCOMING',
  'DOCUMENTS_PENDING',
  'DATA_RECEIVED',
  'IN_PREPARATION',
  'PREPARED',
  'READY_TO_FILE',
  'FILED',
  'VERIFIED',
];

export const ComplianceDetailView: React.FC<ComplianceDetailViewProps> = ({
  compliance,
  onBack,
  onUpdateStatus,
  users,
  canUpdate,
  isUpdating,
}) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [transitionLoadingStatus, setTransitionLoadingStatus] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const isOverdue =
    (compliance.status !== 'FILED' &&
      compliance.status !== 'VERIFIED' &&
      compliance.status !== 'LATE') &&
    (compliance.statutory_due_date < today || compliance.status === 'OVERDUE');

  const currentStageIndex = LIFECYCLE_STAGES.indexOf(compliance.status);
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[compliance.status] || [];

  const handleQuickTransition = async (nextStatus: ComplianceStatus) => {
    setTransitionLoadingStatus(nextStatus);
    try {
      await onUpdateStatus(compliance.id, { status: nextStatus });
    } finally {
      setTransitionLoadingStatus(null);
    }
  };

  return (
    <div className="compliance-container">
      {/* 1. Back Navigation & Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="ghost" size="sm" onClick={onBack} iconLeft={<ArrowLeft size={16} />}>
          Back to Compliance Register
        </Button>
        {canUpdate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStatusModalOpen(true)}
            iconLeft={<Edit2 size={14} />}
          >
            Update Workflow & Details
          </Button>
        )}
      </div>

      {/* 2. Header Information Card */}
      <div className="compliance-detail-header-card">
        <div>
          <div className="compliance-detail-title-group">
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              {compliance.return_type.replace('_', '-')} — {compliance.tax_period}
            </h1>
            <Badge variant="primary" size="md">
              FY {compliance.financial_year}
            </Badge>
            {renderComplianceStatusBadge(compliance.status)}
            {renderPriorityBadge(compliance.priority)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)' }}>
              Client: <strong>{compliance.client_name || compliance.client_legal_name}</strong>
            </span>
            <span style={{ color: 'var(--color-slate-300)' }}>•</span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
              }}
            >
              {compliance.gstin}
            </span>
          </div>
        </div>

        {/* Due Date Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: isOverdue ? 'var(--color-danger-bg, #fef2f2)' : 'var(--color-slate-50)',
            border: `1px solid ${isOverdue ? 'var(--color-danger-border, #fecaca)' : 'var(--color-slate-200)'}`,
            borderRadius: 'var(--radius-lg, 8px)',
          }}
        >
          {isOverdue ? (
            <AlertCircle size={22} style={{ color: 'var(--color-danger-text, #dc2626)' }} />
          ) : (
            <Calendar size={22} style={{ color: 'var(--color-primary-600)' }} />
          )}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-slate-500)' }}>
              Statutory Deadline
            </div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: isOverdue ? 'var(--color-danger-text, #dc2626)' : 'var(--color-slate-900)',
              }}
            >
              {compliance.statutory_due_date} {isOverdue && '(Overdue)'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lifecycle Visualizer */}
      <div className="compliance-card">
        <div className="compliance-card-title">
          <Clock size={16} />
          <span>Compliance Lifecycle Progression</span>
        </div>
        <div className="compliance-lifecycle-tracker">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx || compliance.status === 'VERIFIED';
            const isActive = compliance.status === stage;
            return (
              <div
                key={stage}
                className={`lifecycle-step ${isActive ? 'lifecycle-step--active' : ''} ${isCompleted ? 'lifecycle-step--completed' : ''}`}
              >
                <div className="lifecycle-dot" />
                <span className="lifecycle-label">{stage.replace(/_/g, ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Split Detail Grid */}
      <div className="compliance-detail-grid">
        {/* Left Column: Obligation & Client Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Obligation Details Card */}
          <div className="compliance-card">
            <div className="compliance-card-title">
              <FileText size={16} />
              <span>Obligation Details</span>
            </div>
            <div className="compliance-info-grid">
              <div className="compliance-info-item">
                <span className="compliance-info-label">Return Type</span>
                <span className="compliance-info-value">{compliance.return_type.replace('_', '-')}</span>
              </div>
              <div className="compliance-info-item">
                <span className="compliance-info-label">Tax Period</span>
                <span className="compliance-info-value">{compliance.tax_period}</span>
              </div>
              <div className="compliance-info-item">
                <span className="compliance-info-label">Financial Year</span>
                <span className="compliance-info-value">{compliance.financial_year}</span>
              </div>
              <div className="compliance-info-item">
                <span className="compliance-info-label">Priority</span>
                <span className="compliance-info-value">{renderPriorityBadge(compliance.priority)}</span>
              </div>
              <div className="compliance-info-item">
                <span className="compliance-info-label">Assigned Staff</span>
                <span className="compliance-info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <UserIcon size={14} style={{ color: 'var(--color-slate-400)' }} />
                  {compliance.assigned_user_name || 'Unassigned'}
                </span>
              </div>
              <div className="compliance-info-item">
                <span className="compliance-info-label">Created At</span>
                <span className="compliance-info-value">{new Date(compliance.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {compliance.notes && (
              <div style={{ marginTop: '0.5rem', backgroundColor: 'var(--color-slate-50)', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-slate-500)', display: 'block', marginBottom: '0.25rem' }}>
                  COMPLIANCE NOTES
                </span>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-800)', whiteSpace: 'pre-wrap' }}>
                  {compliance.notes}
                </p>
              </div>
            )}
          </div>

          {/* Client & GSTIN Context Card */}
          <div className="compliance-card">
            <div className="compliance-card-title">
              <Building2 size={16} />
              <span>Client & Operating Entity</span>
            </div>
            <div className="compliance-info-grid">
              <div className="compliance-info-item">
                <span className="compliance-info-label">Client Legal Name</span>
                <span className="compliance-info-value">{compliance.client_legal_name}</span>
              </div>
              <div className="compliance-info-item">
                <span className="compliance-info-label">Trade Name</span>
                <span className="compliance-info-value">{compliance.trade_name || '-'}</span>
              </div>
              <div className="compliance-info-item">
                <span className="compliance-info-label">GSTIN</span>
                <span className="compliance-info-value" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {compliance.gstin}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-start' }}>
              <Link
                to={`/clients/${compliance.client}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-600)',
                  textDecoration: 'none',
                }}
              >
                <span>View Complete Client 360 Profile</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Status Transitions & Filing Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Actions Panel */}
          {canUpdate && allowedTransitions.length > 0 && (
            <div className="compliance-card">
              <div className="compliance-card-title">
                <ChevronRight size={16} />
                <span>Available Workflow Actions</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-slate-600)' }}>
                Advance this compliance obligation to its next valid lifecycle state:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {allowedTransitions.map((nextStatus) => (
                  <Button
                    key={nextStatus}
                    variant={nextStatus === 'FILED' || nextStatus === 'VERIFIED' ? 'primary' : 'outline'}
                    size="sm"
                    loading={transitionLoadingStatus === nextStatus}
                    disabled={isUpdating}
                    onClick={() => handleQuickTransition(nextStatus)}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>Move to <strong>{nextStatus.replace(/_/g, ' ')}</strong></span>
                    <ChevronRight size={14} />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Filing Status Summary Card */}
          <div className="compliance-card">
            <div className="compliance-card-title">
              <ShieldCheck size={16} />
              <span>Filing Status Record</span>
            </div>

            {compliance.has_filing && compliance.filing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--color-emerald-600)' }} />
                  <strong style={{ color: 'var(--color-slate-900)', fontSize: '0.9375rem' }}>
                    Return Recorded as Filed
                  </strong>
                </div>

                <div className="compliance-info-grid">
                  <div className="compliance-info-item">
                    <span className="compliance-info-label">ARN</span>
                    <span className="compliance-info-value" style={{ fontFamily: 'monospace' }}>
                      {compliance.filing.arn || 'N/A'}
                    </span>
                  </div>
                  <div className="compliance-info-item">
                    <span className="compliance-info-label">Actual Filing Date</span>
                    <span className="compliance-info-value">{compliance.filing.actual_filing_date}</span>
                  </div>
                  <div className="compliance-info-item">
                    <span className="compliance-info-label">Acknowledgement No</span>
                    <span className="compliance-info-value">{compliance.filing.acknowledgement_number || '-'}</span>
                  </div>
                  <div className="compliance-info-item">
                    <span className="compliance-info-label">Tax Liability</span>
                    <span className="compliance-info-value">₹{compliance.filing.tax_liability}</span>
                  </div>
                  <div className="compliance-info-item">
                    <span className="compliance-info-label">Cash Paid</span>
                    <span className="compliance-info-value">₹{compliance.filing.cash_paid}</span>
                  </div>
                  {compliance.filing.verification_date && (
                    <div className="compliance-info-item">
                      <span className="compliance-info-label">Verified On</span>
                      <span className="compliance-info-value">{compliance.filing.verification_date}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', lineHeight: '1.4' }}>
                <p>
                  No return filing has been submitted for this obligation yet.
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
                  Once prepared and confirmed with client data, the filing can be recorded and verified through the GST Filing vertical slice.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Status Modal */}
      <ComplianceStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        compliance={compliance}
        users={users}
        onUpdate={onUpdateStatus}
        isSubmitting={isUpdating}
      />
    </div>
  );
};
