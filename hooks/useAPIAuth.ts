import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { USER_AUTH_TOKEN_KEY, clearAllTokens } from '../lib/token-keys'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status?: number
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * Reusable hook for making authenticated API calls with access tokens
 * Automatically handles token retrieval, 401 auto-logout, and redirect to login
 */
export function useAPIAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get access token from localStorage
   */
  const getAccessToken = useCallback((): string | null => {
    try {
      if (typeof window === 'undefined') return null
      const token = localStorage.getItem(USER_AUTH_TOKEN_KEY)
      return token
    } catch (err) {
      console.error('Failed to get access token:', err)
      return null
    }
  }, [])

  /**
   * Handle 401 Unauthorized - auto logout and redirect to login
   */
  const handle401Logout = useCallback(async (currentPath?: string) => {
    try {
      // Clear all stored tokens
      clearAllTokens()

      // Determine return URL (current page or provided path)
      const returnUrl = currentPath || router.asPath
      const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`

      // Redirect to login
      await router.push(loginUrl)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [router])

  /**
   * Make authenticated API request with automatic token handling and 401 detection
   */
  const request = useCallback(
    async <T = any>(
      endpoint: string,
      method: HttpMethod = 'GET',
      body?: any,
      customHeaders?: Record<string, string>
    ): Promise<ApiResponse<T>> => {
      try {
        setLoading(true)
        setError(null)

        // Get access token
        const token = getAccessToken()
        if (!token) {
          // No token - redirect to login
          await handle401Logout()
          return {
            success: false,
            error: 'Authentication required. Redirecting to login...',
            status: 401,
          }
        }

        // Build headers with Bearer token
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...customHeaders,
        }

        // Make API request
        const response = await fetch(endpoint, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          cache: 'no-store', // Prevent browser caching of API responses
        })

        // Parse response
        const result = await response.json()

        // Handle 401 Unauthorized - auto logout
        if (response.status === 401) {
          setError('Session expired. Redirecting to login...')
          await handle401Logout()
          return {
            success: false,
            error: 'Unauthorized. Session expired.',
            status: 401,
            data: result,
          }
        }

        if (!response.ok) {
          const errorMessage =
            result.message || result.error || `HTTP ${response.status}: ${response.statusText}`
          setError(errorMessage)

          return {
            success: false,
            error: errorMessage,
            status: response.status,
            data: result,
          }
        }

        setLoading(false)
        return {
          success: true,
          data: result.data || result,
          message: result.message,
          status: response.status,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Request failed'
        setError(errorMessage)

        return {
          success: false,
          error: errorMessage,
          status: 500,
        }
      } finally {
        setLoading(false)
      }
    },
    [getAccessToken, handle401Logout]
  )

  /**
   * Convenience methods for common HTTP verbs
   */
  const get = useCallback(
    <T = any>(endpoint: string, customHeaders?: Record<string, string>) =>
      request<T>(endpoint, 'GET', undefined, customHeaders),
    [request]
  )

  const post = useCallback(
    <T = any>(endpoint: string, body?: any, customHeaders?: Record<string, string>) =>
      request<T>(endpoint, 'POST', body, customHeaders),
    [request]
  )

  const put = useCallback(
    <T = any>(endpoint: string, body?: any, customHeaders?: Record<string, string>) =>
      request<T>(endpoint, 'PUT', body, customHeaders),
    [request]
  )
  
  const patch = useCallback(
    <T = any>(endpoint: string, body?: any, customHeaders?: Record<string, string>) =>
      request<T>(endpoint, 'PATCH', body, customHeaders),
    [request]
  )

  const delete_ = useCallback(
    <T = any>(endpoint: string, customHeaders?: Record<string, string>) =>
      request<T>(endpoint, 'DELETE', undefined, customHeaders),
    [request]
  )

  return {
    // State
    loading,
    error,
    // Methods
    request,
    get,
    post,
    put,
    patch,
    delete: delete_,
    del: delete_,
    getAccessToken,
    handle401Logout,
  }
}
