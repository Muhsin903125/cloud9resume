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
        try {
          const signInResponse = await apiClient.post('/auth/signin-github', {
            code,
          })

          const { id, email, name, picture } = signInResponse.data

          // Store in localStorage
          localStorage.setItem('user_id', id)
          localStorage.setItem('user_email', email)
          localStorage.setItem('user_name', name || email)
          localStorage.setItem('user_picture', picture || '')

          console.log('GitHub signin successful')
          router.push('/dashboard')
        } catch (signInError: any) {
          // If user not found (404), try to sign up
          if (signInError.response?.status === 404) {
            console.log('User not found, attempting signup...')

            try {
              const signUpResponse = await apiClient.post('/auth/signup-github', {
                code,
              })

              const { id, email, name, picture } = signUpResponse.data

              // Store in localStorage
              localStorage.setItem('user_id', id)
              localStorage.setItem('user_email', email)
              localStorage.setItem('user_name', name || email)
              localStorage.setItem('user_picture', picture || '')

              console.log('GitHub signup successful')
              router.push('/dashboard')
            } catch (signUpError: any) {
              console.error('GitHub signup error:', signUpError)
              const errorMessage = signUpError.response?.data?.message || 'Signup failed'
              router.push(`/signup?error=${encodeURIComponent(errorMessage)}`)
            }
          } else {
            console.error('GitHub signin error:', signInError)
            const errorMessage = signInError.response?.data?.message || 'Login failed'
            router.push(`/login?error=${encodeURIComponent(errorMessage)}`)
          }
        }
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
