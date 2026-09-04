import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  FolderLock,
  ListTodo,
  Receipt,
  MessageSquare,
  LogOut,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'

interface NavItem {
  name: string
  to: string
  icon: React.ElementType
  minRole?: 'STAFF' | 'CA_MANAGER' | 'ADMIN'
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Clients', to: '/clients', icon: Users },
  { name: 'GST Compliance', to: '/compliance', icon: CheckCircle2 },
  { name: 'GST Filing', to: '/filing', icon: FileSpreadsheet },
  { name: 'Documents', to: '/documents', icon: FolderLock },
  { name: 'Tasks', to: '/tasks', icon: ListTodo },
  { name: 'Billing', to: '/billing', icon: Receipt },
  { name: 'Communications', to: '/communications', icon: MessageSquare },
]

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()

  const firmName = user?.firm?.display_name || user?.firm?.legal_name || 'Practice Hub'

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 40,
            display: 'block',
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--color-slate-200)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'transform var(--transition-normal)',
        }}
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Practice / Firm Header */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.25rem',
            borderBottom: '1px solid var(--color-slate-200)',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.3)',
            }}
          >
            KS
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h1
              style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--color-slate-900)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
              }}
            >
              {firmName}
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-slate-500)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Building2 size={11} /> CA Practice Management
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-primary-700)' : 'var(--color-slate-600)',
                  backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                  transition: 'background-color var(--transition-fast), color var(--transition-fast)',
                })}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.name}</span>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile & Logout Bottom Section */}
        <div
          style={{
            padding: '0.875rem',
            borderTop: '1px solid var(--color-slate-200)',
            backgroundColor: 'var(--color-slate-50)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-slate-200)',
            }}
          >
            <div style={{ overflow: 'hidden', paddingRight: '0.5rem' }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-slate-900)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name}
              </p>
              <p
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--color-slate-500)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              style={{
                color: 'var(--color-slate-400)',
                padding: '0.375rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-slate-400)')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .app-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            z-index: 50;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          }
          .app-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
