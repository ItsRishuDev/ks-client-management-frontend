import React from 'react'
import { Menu, Bell, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useLocation } from 'react-router-dom'

interface HeaderProps {
  onToggleSidebar: () => void
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Practice Dashboard', subtitle: 'Operational overview and pending priorities' },
  '/clients': { title: 'Client Directory', subtitle: 'Client master, entities and GST registrations' },
  '/compliance': { title: 'GST Compliance Queue', subtitle: 'Periodic return tracking and obligation lifecycle' },
  '/filing': { title: 'GST Return Filing', subtitle: 'GSTR-1 & GSTR-3B preparation, filing and verification' },
  '/documents': { title: 'Document Center', subtitle: 'Requisitions, received files and verification pipeline' },
  '/tasks': { title: 'Task & Work Queue', subtitle: 'Team assignments, status transitions and priorities' },
  '/billing': { title: 'Billing & Receivables', subtitle: 'Invoices, payment allocations and collections' },
  '/communications': { title: 'Client Communications', subtitle: 'Notifications, email dispatches and reminders' },
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth()
  const location = useLocation()

  const currentRouteInfo = ROUTE_TITLES[location.pathname] || {
    title: 'KS Client Management',
    subtitle: 'Practice management platform',
  }

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-slate-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Mobile Menu button + Breadcrumb/Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-slate-600)',
            padding: '0.375rem',
            borderRadius: '6px',
            border: '1px solid var(--color-slate-200)',
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-slate-900)',
              lineHeight: 1.2,
            }}
          >
            {currentRouteInfo.title}
          </h2>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-slate-500)',
              display: 'none',
            }}
            className="header-subtitle"
          >
            {currentRouteInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Status badge, Notification bell & User pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            color: 'var(--color-success-text)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <ShieldCheck size={13} />
          <span>Tenant Isolated</span>
        </div>

        <button
          style={{
            color: 'var(--color-slate-500)',
            padding: '0.5rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--color-slate-200)',
          }}
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.625rem 0.25rem 0.375rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-slate-100)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--color-slate-700)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6875rem',
              fontWeight: 700,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span>{user?.name?.split(' ')[0]}</span>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .header-subtitle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  )
}
