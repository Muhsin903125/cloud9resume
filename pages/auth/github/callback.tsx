import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { apiClient } from '@/lib/apiClient'

export default function GitHubCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { code, error: urlError } = router.query

        if (urlError) {
          setError(decodeURIComponent(urlError as string))
          return
        }

        if (!code) {
          setError('No authorization code received')
          return
        }

        console.log('GitHub callback - code:', code)

        // Try to sign in existing user first
        const signInResponse = await apiClient.post('/auth/signin-github', {
          code,
        })

        console.log('GitHub signin response:', signInResponse)

        // Check if signin was successful with new format: { success, accessToken, expiresIn, user: {...} }
        if (!signInResponse.error && signInResponse.data?.user?.id && signInResponse.data?.accessToken) {
          console.log('GitHub signin successful')
          
          // Store JWT token with x_ prefix
          localStorage.setItem('x_user_auth_token', signInResponse.data.accessToken)
          localStorage.setItem('x_user_id', signInResponse.data.user.id)
          if (signInResponse.data.user.email) {
            localStorage.setItem('x_user_email', signInResponse.data.user.email)
          }
          
          // Store token expiry
          const expiryTime = Date.now() + (signInResponse.data.expiresIn * 1000)
          localStorage.setItem('x_token_expiry', expiryTime.toString())
          
          router.push('/dashboard')
          return
        }

        // Check if error indicates user not found - try signup
        if (signInResponse.error?.includes('not found') || signInResponse.error?.includes('404')) {
          console.log('User not found, attempting signup...')

          const signUpResponse = await apiClient.post('/auth/signup-github', {
            code,
          })

          console.log('GitHub signup response:', signUpResponse)

          // Check if signup was successful with new format: { success, accessToken, expiresIn, user: {...} }
          if (!signUpResponse.error && signUpResponse.data?.user?.id && signUpResponse.data?.accessToken) {
            console.log('GitHub signup successful')
            
            // Store JWT token with x_ prefix
            localStorage.setItem('x_user_auth_token', signUpResponse.data.accessToken)
            localStorage.setItem('x_user_id', signUpResponse.data.user.id)
            if (signUpResponse.data.user.email) {
              localStorage.setItem('x_user_email', signUpResponse.data.user.email)
            }
            
            // Store token expiry
            const expiryTime = Date.now() + (signUpResponse.data.expiresIn * 1000)
            localStorage.setItem('x_token_expiry', expiryTime.toString())
            
            router.push('/dashboard')
            return
          }

          // Signup failed
          const errorMessage = signUpResponse.error || 'Signup failed'
          console.error('GitHub signup error:', errorMessage)
          router.push(`/signup?error=${encodeURIComponent(errorMessage)}`)
          return
        }

        // Other signin error
        const errorMessage = signInResponse.error || 'Login failed'
        console.error('GitHub signin error:', errorMessage)
        router.push(`/login?error=${encodeURIComponent(errorMessage)}`)
      } catch (err) {
        console.error('GitHub callback error:', err)
        setError('An unexpected error occurred')
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router.isReady, router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Login Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Completing GitHub login...</p>
      </div>
    </div>
  )
}
