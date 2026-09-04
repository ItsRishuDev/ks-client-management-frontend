import { createContext } from 'react'
import type { LoginPayload } from '../api/auth'
import type { User, ApiError } from '../types/auth'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: ApiError | null
  login: (credentials: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
