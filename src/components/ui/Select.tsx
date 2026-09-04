import React, { forwardRef, useId } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      options,
      children,
      fullWidth = false,
      className = '',
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || (label ? generatedId : undefined);

    const selectClasses = [
      'ui-select',
      error ? 'ui-select--error' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`ui-form-group ${fullWidth ? 'ui-form-group--full' : ''}`}>
        {label && (
          <label htmlFor={selectId} className="ui-form-label">
            {label}
            {required && <span className="ui-form-required" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          required={required}
          className={selectClasses}
          aria-invalid={!!error}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <span className="ui-form-error" role="alert">{error}</span>
        ) : helperText ? (
          <span className="ui-form-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
