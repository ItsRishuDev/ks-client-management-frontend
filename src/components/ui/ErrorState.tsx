import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this data. Please try again.',
  onRetry,
  action,
  className = '',
}) => {
  return (
    <div className={`ui-error-state ${className}`} role="alert">
      <AlertCircle className="ui-error-icon" />
      <h3 className="ui-error-title">{title}</h3>
      {description && <p className="ui-error-desc">{description}</p>}
      {action ? (
        action
      ) : onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          iconLeft={<RefreshCw size={14} />}
        >
          Try Again
        </Button>
      ) : null}
    </div>
  );
};
