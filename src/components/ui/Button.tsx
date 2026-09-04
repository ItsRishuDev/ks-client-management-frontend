import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const classNames = [
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      fullWidth ? 'ui-button--full' : '',
      loading || disabled ? 'ui-button--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classNames}
        {...props}
      >
        {loading && <Loader2 className="ui-spinner ui-spinner--sm" aria-hidden="true" />}
        {!loading && iconLeft && <span className="ui-button-icon">{iconLeft}</span>}
        {children && <span>{children}</span>}
        {!loading && iconRight && <span className="ui-button-icon">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
