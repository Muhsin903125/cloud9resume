// Authentication Helper Functions

import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Custom hook for authentication state
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            firstName: session.user.user_metadata?.firstName,
            lastName: session.user.user_metadata?.lastName,
            avatar: session.user.user_metadata?.avatar,
          })
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Authentication error')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            firstName: session.user.user_metadata?.firstName,
            lastName: session.user.user_metadata?.lastName,
            avatar: session.user.user_metadata?.avatar,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, error }
}

// Authentication functions
export const auth = {
  async signUp(email: string, password: string, userData: { firstName: string; lastName: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      }
    }
  },

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      }
    }
  }
}

// Protected route wrapper
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuth()

    if (loading) {
      return null // Handle loading state in the component that uses this HOC
    }

    if (!user) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return null
    }

    return React.createElement(Component, props)
  }
}

export default auth