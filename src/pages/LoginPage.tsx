import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Lock, Mail, AlertCircle, Building2, ArrowRight } from 'lucide-react'

interface LocationState {
  from?: {
    pathname?: string
  }
}

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, error, clearError } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // If already authenticated, redirect to destination or root
  if (isAuthenticated) {
    const from = (location.state as LocationState)?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setSubmitting(true)
    clearError()
    try {
      await login({ email: email.trim(), password })
    } catch {
      // Error handled by AuthContext
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-slate-100)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--color-slate-200)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            padding: '2rem 2rem 1.5rem',
            textAlign: 'center',
            borderBottom: '1px solid var(--color-slate-100)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-600)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.25rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }}
          >
            KS
          </div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-slate-900)',
              marginBottom: '0.25rem',
            }}
          >
            KS Client Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)' }}>
            Chartered Accountant & GST Practice Hub
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger-text)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 600 }}>Authentication Error</p>
                <p style={{ fontSize: '0.8125rem' }}>{error.message}</p>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.375rem',
              }}
            >
              Email Address
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--color-slate-300)',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                padding: '0 0.75rem',
              }}
            >
              <Mail size={16} color="var(--color-slate-400)" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ca@practice.com"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  padding: '0.625rem 0.5rem',
                  color: 'var(--color-slate-900)',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.375rem',
              }}
            >
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--color-slate-300)',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                padding: '0 0.75rem',
              }}
            >
              <Lock size={16} color="var(--color-slate-400)" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  padding: '0.625rem 0.5rem',
                  color: 'var(--color-slate-900)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-primary-600)',
              color: '#ffffff',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
              opacity: submitting ? 0.7 : 1,
              transition: 'background-color var(--transition-fast)',
            }}
          >
            {submitting ? 'Signing in...' : 'Sign In to Workspace'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--color-slate-50)',
            borderTop: '1px solid var(--color-slate-200)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-slate-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
          }}
        >
          <Building2 size={13} />
          <span>Multi-tenant, role-isolated practice platform</span>
        </div>
      </div>
    </div>
  )
}
