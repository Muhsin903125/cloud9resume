// Authentication utilities and hooks
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { apiClient } from './apiClient'

export interface User {
  id: string
  email: string
  profile?: {
    first_name: string
    last_name: string
    credits: number
  }
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Sign up function
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  acceptTerms: boolean
) {
  return apiClient.post('/auth/signup', {
    email,
    password,
    firstName,
    lastName,
    acceptTerms,
  })
}

// Sign in function
export async function signIn(email: string, password: string) {
  const result = await apiClient.post('/auth/signin', {
    email,
    password,
  })

  if (result.data && result.data.session?.access_token) {
    // Store session data
    localStorage.setItem('auth_token', result.data.session.access_token)
    localStorage.setItem('user_id', result.data.user.id)
    localStorage.setItem('user_email', result.data.user.email)

    if (result.data.user.profile) {
      localStorage.setItem('user_profile', JSON.stringify(result.data.user.profile))
    }
  }

  return result
}

// Sign out function
export async function signOut() {
  const result = await apiClient.post('/auth/signout', {})

  // Clear session data
  if (result.data) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_profile')
  }

  return result
}

// Get current session
export async function getSession() {
  return apiClient.get('/auth/session')
}

// Reset password
export async function resetPassword(email: string) {
  return apiClient.post('/auth/reset-password', { email })
}

// Verify email
export async function verifyEmail(token: string, type: string = 'email') {
  return apiClient.post('/auth/verify-email', { token, type })
}

// Custom hook for authentication
export function useAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }))
        return
      }

      try {
        const result = await getSession()

        if (result.data) {
          setAuthState({
            user: result.data.user,
            session: result.data.session,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token')
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }))
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }))
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    await signOut()
    setAuthState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    })
    router.push('/')
  }

  return {
    ...authState,
    logout,
  }
}

// Protected page wrapper
export function withAuth(Component: any) {
  return function ProtectedComponent(props: any) {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return React.createElement(Component, props)
  }
}