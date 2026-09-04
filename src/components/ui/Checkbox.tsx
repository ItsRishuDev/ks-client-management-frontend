import React, { forwardRef, useId } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      description,
      error,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className={`ui-form-group ${className}`}>
        <label
          htmlFor={checkboxId}
          className={`ui-checkbox-container ${disabled ? 'ui-checkbox-container--disabled' : ''}`}
        >
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className="ui-checkbox-input"
            aria-invalid={!!error}
            {...props}
          />
          {(label || description) && (
            <div className="ui-checkbox-label-wrapper">
              {label && <span className="ui-checkbox-label">{label}</span>}
              {description && <span className="ui-checkbox-description">{description}</span>}
            </div>
          )}
        </label>
        {error && <span className="ui-form-error" role="alert">{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
