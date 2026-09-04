import { apiClient } from './client'
import type { User } from '../types/auth'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'CA_MANAGER' | 'STAFF'
    firm_id: string
  }
}

export interface AuthMeResponse {
  user: User
}

export const authApi = {
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    return apiClient<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  logout: async (): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/logout/', {
      method: 'POST',
    })
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient<AuthMeResponse>('/auth/me/', {
      method: 'GET',
    })
    return response.user
  },
}
