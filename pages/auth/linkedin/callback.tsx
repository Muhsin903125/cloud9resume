import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { apiClient } from '@/lib/apiClient'

export default function LinkedInCallback() {
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

        console.log('LinkedIn callback - code:', code)

        // Try to sign in existing user first
        const signInResponse = await apiClient.post('/auth/signin-linkedin', {
          code,
        })

        // If signin failed (user not found), try signup
        if (signInResponse.error) {
          console.log('User not found, attempting signup...')

          const signUpResponse = await apiClient.post('/auth/signup-linkedin', {
            code,
          })

          if (signUpResponse.error) {
            console.error('LinkedIn signup error:', signUpResponse.error)
            const errorMessage = signUpResponse.message || 'Signup failed'
            router.push(`/signup?error=${encodeURIComponent(errorMessage)}`)
            return
          }

          const { id, email, name, picture } = signUpResponse.data

          // Store in localStorage
          localStorage.setItem('user_id', id)
          localStorage.setItem('user_email', email)
          localStorage.setItem('user_name', name || email)
          localStorage.setItem('user_picture', picture || '')

          console.log('LinkedIn signup successful')
          router.push('/dashboard')
        } else {
          const { id, email, name, picture } = signInResponse.data

          // Store in localStorage
          localStorage.setItem('user_id', id)
          localStorage.setItem('user_email', email)
          localStorage.setItem('user_name', name || email)
          localStorage.setItem('user_picture', picture || '')

          console.log('LinkedIn signin successful')
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('LinkedIn callback error:', err)
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
        <p className="text-gray-600">Completing LinkedIn login...</p>
      </div>
    </div>
  )
}
