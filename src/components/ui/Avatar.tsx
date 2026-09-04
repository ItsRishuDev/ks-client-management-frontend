import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  src,
  size = 'md',
  status,
  className = '',
  ...props
}) => {
  const getInitials = (n: string) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'online': return '#22c55e';
      case 'busy': return '#ef4444';
      case 'away': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className={`ui-avatar ui-avatar--${size} ${className}`} {...props}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {status && (
        <span
          className="ui-avatar-status"
          style={{ backgroundColor: getStatusColor(status) }}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};
