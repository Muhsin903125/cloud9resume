/**
 * Standardized token storage keys for localStorage
 * All keys use 'x_' prefix to avoid conflicts
 */

export const USER_AUTH_TOKEN_KEY = 'x_user_auth_token'
export const USER_ID_KEY = 'x_user_id'
export const USER_EMAIL_KEY = 'x_user_email'
export const TOKEN_EXPIRY_KEY = 'x_token_expiry'

/**
 * Clear all auth-related tokens from localStorage
 */
export function clearAllTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(USER_EMAIL_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  }
}

/**
 * Get all stored auth data
 */
export function getStoredAuthData() {
  if (typeof window === 'undefined') {
    return null
  }

  const token = localStorage.getItem(USER_AUTH_TOKEN_KEY)
  const userId = localStorage.getItem(USER_ID_KEY)
  const email = localStorage.getItem(USER_EMAIL_KEY)
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)

  if (!token || !userId) {
    return null
  }

  return {
    token,
    userId,
    email,
    expiry: expiry ? parseInt(expiry, 10) : null,
  }
}

/**
 * Check if stored token is still valid (not expired)
 */
export function isTokenValid() {
  if (typeof window === 'undefined') {
    return false
  }

  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiry) {
    return false
  }

  const expiryTime = parseInt(expiry, 10)
  const now = Date.now()

  return now < expiryTime
}
