import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { signUpWithGoogle, signInWithGoogle } from '../../../lib/authUtils'

/**
 * Google OAuth Callback Handler
 * This page receives the redirect from Google after user authentication
 * URL: https://cloud9resume.vercel.app/auth/google/callback
 * Google redirects here with: #id_token=...
 */
export default function GoogleCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the ID token from the URL hash
        const hash = window.location.hash
        const params = new URLSearchParams(hash.substring(1))
        const idToken = params.get('id_token')

        console.log('Google callback page loaded, hash:', hash.substring(0, 50) + '...')

        if (!idToken) {
          console.error('No ID token found in callback')
          router.push('/login?error=no_token')
          return
        }

        console.log('ID token found, attempting authentication')

        // Try to sign in first (existing user)
        const signInResult = await signInWithGoogle(idToken)

        console.log('Sign in result:', {
          hasError: !!signInResult.error,
          error: signInResult.error,
          hasData: !!signInResult.data,
          data: signInResult.data ? { id: signInResult.data.id, email: signInResult.data.email } : null,
        })

        // Check if sign in was successful (no error and has user data)
        if (!signInResult.error && signInResult.data?.id) {
          console.log('Sign in successful, storing auth and redirecting to dashboard')
          
          // Store auth token if available
          if (signInResult.data.access_token) {
            localStorage.setItem('auth_token', signInResult.data.access_token)
          }
          
          // Store user info
          localStorage.setItem('user_id', signInResult.data.id)
          if (signInResult.data.email) {
            localStorage.setItem('user_email', signInResult.data.email)
          }
          if (signInResult.data.name) {
            localStorage.setItem('user_name', signInResult.data.name)
          }
          if (signInResult.data.picture) {
            localStorage.setItem('user_picture', signInResult.data.picture)
          }
          
          router.push('/dashboard')
          return
        }

        // Check if error indicates user not found
        if (signInResult.error?.includes('not found') || signInResult.error?.includes('No account found')) {
          console.log('User not found, attempting signup')
          const signUpResult = await signUpWithGoogle(idToken)

          console.log('Sign up result:', {
            hasError: !!signUpResult.error,
            error: signUpResult.error,
            hasData: !!signUpResult.data,
          })

          // Check if sign up was successful (no error and has user data)
          if (!signUpResult.error && signUpResult.data?.id) {
            console.log('Signup successful, storing auth and redirecting to dashboard')
            
            // Store auth token if available
            if (signUpResult.data.access_token) {
              localStorage.setItem('auth_token', signUpResult.data.access_token)
            }
            
            // Store user info
            localStorage.setItem('user_id', signUpResult.data.id)
            if (signUpResult.data.email) {
              localStorage.setItem('user_email', signUpResult.data.email)
            }
            if (signUpResult.data.name) {
              localStorage.setItem('user_name', signUpResult.data.name)
            }
            if (signUpResult.data.picture) {
              localStorage.setItem('user_picture', signUpResult.data.picture)
            }
            
            router.push('/dashboard')
            return
          }

          // Signup failed
          const errorMsg = signUpResult.error || 'Signup failed'
          console.error('Signup failed:', errorMsg)
          router.push(`/signup?error=${encodeURIComponent(errorMsg)}`)
          return
        }

        // Other sign in error
        const errorMsg = signInResult.error || 'Sign in failed'
        console.error('Sign in failed:', errorMsg)
        router.push(`/login?error=${encodeURIComponent(errorMsg)}`)
      } catch (error) {
        console.error('Callback error:', error)
        router.push(`/login?error=callback_error`)
      }
    }

    if (typeof window !== 'undefined') {
      handleCallback()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Processing login...</h1>
        <p className="text-gray-600">Please wait while we verify your credentials</p>
      </div>
    </div>
  )
}
