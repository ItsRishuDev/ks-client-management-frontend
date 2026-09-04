export type UserRole = 'ADMIN' | 'CA_MANAGER' | 'STAFF'

export interface Firm {
  id: string
  legal_name: string
  display_name: string
  practitioner_name?: string
  registration_frn?: string
  gstin?: string
  address?: string
  email?: string
  phone?: string
  status?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  is_active: boolean
  firm?: Firm | null
  firm_id?: string
  created_at?: string
  updated_at?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[] | string>
}

export interface ApiResponseError {
  error: ApiError
}
