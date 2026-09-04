import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`ui-loading-state ${className}`} role="status">
      <Loader2 className={`ui-spinner ui-spinner--${size}`} style={{ color: 'var(--color-primary-600)' }} />
      {message && <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)' }}>{message}</p>}
    </div>
  );
};
