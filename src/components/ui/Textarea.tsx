import React, { forwardRef, useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      required,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || (label ? generatedId : undefined);

    const textareaClasses = [
      'ui-textarea',
      error ? 'ui-textarea--error' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`ui-form-group ${fullWidth ? 'ui-form-group--full' : ''}`}>
        {label && (
          <label htmlFor={textareaId} className="ui-form-label">
            {label}
            {required && <span className="ui-form-required" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          required={required}
          className={textareaClasses}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <span className="ui-form-error" role="alert">{error}</span>
        ) : helperText ? (
          <span className="ui-form-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
