import type { ApiError } from '../types/auth'

export class ApiRequestError extends Error {
  code: string
  status: number
  details?: Record<string, string[] | string>

  constructor(status: number, error: ApiError) {
    super(error.message || 'An unexpected API error occurred.')
    this.name = 'ApiRequestError'
    this.status = status
    this.code = error.code || 'API_ERROR'
    this.details = error.details
  }
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : null
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options

  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }
  }

  const csrfToken = getCsrfToken()
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...(customConfig.body && !(customConfig.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: 'include', // Includes Django session cookies
  }

  const response = await fetch(url, config)

  if (response.status === 204) {
    return {} as T
  }

  let data: Record<string, unknown> | null
  try {
    data = (await response.json()) as Record<string, unknown>
  } catch {
    data = null
  }

  if (!response.ok) {
    const errorData: ApiError = (data?.error as ApiError) || {
      code: `HTTP_${response.status}`,
      message: (data?.detail as string) || response.statusText || 'Request failed',
      details: data?.details as Record<string, string[] | string> | undefined,
    }
    throw new ApiRequestError(response.status, errorData)
  }

  return data as T
}
