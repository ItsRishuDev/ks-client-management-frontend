import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { AppRoutes } from '../routes/AppRoutes'
import { LoginPage } from '../pages/LoginPage'

// Mock the auth API
vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

import { authApi } from '../api/auth'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '../components/ui'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

describe('Phase 1 - Authentication & App Shell', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
  })

  it('renders login page with email, password fields and sign in button', () => {
    vi.mocked(authApi.getCurrentUser).mockRejectedValueOnce({
      status: 401,
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication required',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={['/login']}>
              <LoginPage />
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in to workspace/i })).toBeInTheDocument()
  })

  it('redirects unauthenticated user from protected root to /login', async () => {
    vi.mocked(authApi.getCurrentUser).mockRejectedValueOnce({
      status: 401,
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication required',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={['/']}>
              <AppRoutes />
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in to workspace/i })).toBeInTheDocument()
    })
  })

  it('renders authenticated app shell when user is logged in', async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValueOnce({
      id: 'usr-1',
      name: 'Rishabh Partner',
      email: 'rishabh@apex.com',
      role: 'ADMIN',
      is_active: true,
      firm: {
        id: 'frm-1',
        legal_name: 'Apex Advisory Services',
        display_name: 'Apex Advisory',
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={['/']}>
              <AppRoutes />
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Apex Advisory')).toBeInTheDocument()
      expect(screen.getByText('Rishabh Partner')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Clients')).toBeInTheDocument()
      expect(screen.getByText('GST Compliance')).toBeInTheDocument()
      expect(screen.getByText('GST Filing')).toBeInTheDocument()
      expect(screen.getByText('Documents')).toBeInTheDocument()
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      expect(screen.getByText('Billing')).toBeInTheDocument()
      expect(screen.getByText('Communications')).toBeInTheDocument()
    })
  })
})
