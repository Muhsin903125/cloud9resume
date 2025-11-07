import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { signUpWithGoogle, signInWithGoogle } from '../../lib/authUtils'

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

        if (signInResult.error) {
          // Check if error is "user not found"
          if (
            signInResult.error.includes('not found') ||
            signInResult.error.includes('No account found')
          ) {
            // User doesn't exist, try to sign up
            console.log('User not found, attempting signup')
            const signUpResult = await signUpWithGoogle(idToken)

            if (signUpResult.error) {
              console.error('Signup failed:', signUpResult.error)
              router.push(`/signup?error=${encodeURIComponent(signUpResult.error)}`)
              return
            }

            // Signup successful
            console.log('Signup successful, redirecting to dashboard')
            router.push('/dashboard')
            return
          }

          // Other sign in error
          console.error('Sign in failed:', signInResult.error)
          router.push(`/login?error=${encodeURIComponent(signInResult.error)}`)
          return
        }

        // Sign in successful
        console.log('Sign in successful, redirecting to dashboard')
        router.push('/dashboard')
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
