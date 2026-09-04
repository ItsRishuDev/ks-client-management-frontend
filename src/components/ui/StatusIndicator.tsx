import React from 'react';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  label?: string;
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = false,
  className = '',
  ...props
}) => {
  const getDotVariant = (s: StatusType) => {
    switch (s) {
      case 'active':
      case 'success':
        return 'ui-status-dot--success';
      case 'warning':
      case 'pending':
        return 'ui-status-dot--warning';
      case 'danger':
        return 'ui-status-dot--danger';
      case 'info':
        return 'ui-status-dot--info';
      case 'purple':
        return 'ui-status-dot--purple';
      case 'inactive':
      default:
        return 'ui-status-dot--neutral';
    }
  };

  return (
    <div className={`ui-status-indicator ${className}`} {...props}>
      <span
        className={`ui-status-dot ${getDotVariant(status)} ${pulse ? 'ui-status-dot--pulse' : ''}`}
        aria-hidden="true"
      />
      {label && <span>{label}</span>}
    </div>
  );
};
