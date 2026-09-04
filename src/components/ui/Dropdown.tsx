import React, { useState, useRef, useEffect } from 'react';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`ui-dropdown ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} role="button" tabIndex={0}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`ui-dropdown-menu ui-dropdown-menu--${align}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  icon,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`ui-dropdown-item ${variant === 'danger' ? 'ui-dropdown-item--danger' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="ui-dropdown-item-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export const DropdownSeparator: React.FC = () => {
  return <div className="ui-dropdown-separator" role="separator" />;
};

export const DropdownHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`ui-dropdown-header ${className}`} {...props}>
      {children}
    </div>
  );
};
