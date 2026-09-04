import React, { useEffect, useState, useCallback } from 'react'
import { authApi } from '../api/auth'
import type { LoginPayload } from '../api/auth'
import type { User, ApiError } from '../types/auth'
import { ApiRequestError } from '../api/client'
import { AuthContext } from './authContextDef'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    let isMounted = true

    authApi
      .getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setUser(null)
          if (err instanceof ApiRequestError && err.status === 401) {
            setError(null)
          } else if (err instanceof ApiRequestError) {
            setError({ code: err.code, message: err.message, details: err.details })
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const refreshUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
      setError(null)
    } catch (err) {
      setUser(null)
      if (err instanceof ApiRequestError && err.status === 401) {
        setError(null)
      } else if (err instanceof ApiRequestError) {
        setError({ code: err.code, message: err.message, details: err.details })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (credentials: LoginPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      await authApi.login(credentials)
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError({ code: err.code, message: err.message, details: err.details })
      } else {
        setError({ code: 'LOGIN_FAILED', message: 'Unable to connect to the server. Please try again.' })
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors and clear state
    } finally {
      setUser(null)
      setError(null)
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
