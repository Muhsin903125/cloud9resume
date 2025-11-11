import { useRouter } from 'next/router'
import { 
  USER_AUTH_TOKEN_KEY, 
  USER_ID_KEY, 
  USER_EMAIL_KEY, 
  TOKEN_EXPIRY_KEY,
  clearAllTokens 
} from './token-keys'

/**
 * Hook for handling logout with token cleanup
 */
export function useLogout() {
  const router = useRouter()

  const logout = async () => {
    try {
      // Clear all tokens
      clearAllTokens()

      // Redirect to login
      await router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if error occurs
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  return { logout }
}

/**
 * Standalone logout function (can be used outside React components)
 */
export function performLogout(redirectUrl: string = '/login') {
  try {
    // Clear all tokens
    clearAllTokens()
    // Redirect
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}

/**
 * Check if user has valid token
 */
export function hasValidToken(): boolean {
  try {
    if (typeof window === 'undefined') {
      console.log('🔍 hasValidToken: Server-side, returning false')
      return false
    }
    
    const token = localStorage.getItem(USER_AUTH_TOKEN_KEY)
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)

    console.log('🔍 hasValidToken check:', {
      hasToken: !!token,
      tokenLength: token?.length,
      hasExpiry: !!expiry,
      expiryValue: expiry,
      currentTime: Date.now(),
      currentTimeReadable: new Date().toISOString()
    })

    if (!token || !expiry) {
      console.log('❌ hasValidToken: Missing token or expiry')
      return false
    }

    // Check if token hasn't expired
    // Expiry can be in milliseconds (from callbacks) or seconds (from storeAuthData)
    const expiryTime = parseInt(expiry, 10)
    const currentTime = Date.now()
    
    // If expiry is very large (> year 3000 in seconds), it's in milliseconds
    if (expiryTime > 32503680000000) {
      const isValid = currentTime < expiryTime
      console.log('✅ hasValidToken (milliseconds format):', {
        isValid,
        expiryTime,
        expiryReadable: new Date(expiryTime).toISOString(),
        currentTime,
        timeUntilExpiry: `${Math.floor((expiryTime - currentTime) / 1000 / 60)} minutes`
      })
      return isValid
    }
    
    // Otherwise it's in seconds
    const isValid = currentTime < (expiryTime * 1000)
    console.log('✅ hasValidToken (seconds format):', {
      isValid,
      expiryTime,
      expiryTimeMs: expiryTime * 1000,
      expiryReadable: new Date(expiryTime * 1000).toISOString(),
      currentTime,
      timeUntilExpiry: `${Math.floor((expiryTime * 1000 - currentTime) / 1000 / 60)} minutes`
    })
    return isValid
  } catch (error) {
    console.error('❌ Token validation error:', error)
    return false
  }
}

/**
 * Get stored user ID
 */
export function getUserId(): string | null {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(USER_ID_KEY)
  } catch (error) {
    console.error('Failed to get user ID:', error)
    return null
  }
}

/**
 * Get stored user email
 */
export function getUserEmail(): string | null {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(USER_EMAIL_KEY)
  } catch (error) {
    console.error('Failed to get user email:', error)
    return null
  }
}

/**
 * Store authentication data in localStorage
 * @param accessToken JWT token
 * @param userId User ID
 * @param email User email
 * @param expiresIn Token expiry in seconds (e.g., 86400 for 24 hours)
 */
export function storeAuthData(accessToken: string, userId: string, email?: string, expiresIn?: number) {
  try {
    if (typeof window === 'undefined') return

    // Store token expiry in milliseconds for consistency with callbacks
    const tokenExpiry = expiresIn 
      ? Date.now() + (expiresIn * 1000)  // Convert seconds to milliseconds
      : Date.now() + 86400000 // Default 24 hours in milliseconds

    localStorage.setItem(USER_AUTH_TOKEN_KEY, accessToken)
    localStorage.setItem(USER_ID_KEY, userId)
    if (email) localStorage.setItem(USER_EMAIL_KEY, email)
    localStorage.setItem(TOKEN_EXPIRY_KEY, tokenExpiry.toString())
  } catch (error) {
    console.error('Failed to store auth data:', error)
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(USER_AUTH_TOKEN_KEY)
  } catch (error) {
    console.error('Failed to get access token:', error)
    return null
  }
}

/**
 * Get return URL from query params, defaults to /dashboard/resume
 */
export function getReturnUrl(query: Record<string, any>): string {
  const returnUrl = query.returnUrl as string
  if (returnUrl && (returnUrl.startsWith('/') || returnUrl.startsWith('http'))) {
    return returnUrl
  }
  return '/dashboard/resume'
}

