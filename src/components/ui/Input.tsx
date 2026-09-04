import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || (label ? generatedId : undefined);

    const inputClasses = [
      'ui-input',
      leftIcon ? 'ui-input--has-left-icon' : '',
      rightIcon ? 'ui-input--has-right-icon' : '',
      error ? 'ui-input--error' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`ui-form-group ${fullWidth ? 'ui-form-group--full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="ui-form-label">
            {label}
            {required && <span className="ui-form-required" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="ui-input-wrapper">
          {leftIcon && <span className="ui-input-icon ui-input-icon--left">{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={inputClasses}
            aria-invalid={!!error}
            {...props}
          />
          {rightIcon && <span className="ui-input-icon ui-input-icon--right">{rightIcon}</span>}
        </div>
        {error ? (
          <span className="ui-form-error" role="alert">{error}</span>
        ) : helperText ? (
          <span className="ui-form-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
