import { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from '../components/Button'
import GoogleOAuthButton from '../components/GoogleOAuthButton'
import { signIn, getGoogleOAuthUrl } from '../lib/authUtils'

const LoginPage: NextPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // Load saved email if remember me was enabled, and check for OAuth errors
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const wasRemembered = localStorage.getItem('rememberMeEnabled') === 'true'
    if (savedEmail && wasRemembered) {
      setFormData(prev => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }

    // Check if there's an error from Google OAuth callback
    if (router.query.error) {
      const errorMsg = Array.isArray(router.query.error) 
        ? router.query.error[0] 
        : router.query.error
      setError(decodeURIComponent(errorMsg))
      
      // Clear error from URL
      window.history.replaceState({}, '', '/login')
    }
  }, [router.query.error])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email)
        localStorage.setItem('rememberMeEnabled', 'true')
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.setItem('rememberMeEnabled', 'false')
      }

      // Call the signin function from authUtils
      const result = await signIn(formData.email, formData.password)

      if (result.error) {
        setError(result.error)
        return
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setGoogleLoading(true)
    // Redirect to Google OAuth
    window.location.href = getGoogleOAuthUrl('signin')
  }

  return (
    <>
      <Head>
        <title>Login - Cloud9 Resume</title>
        <meta name="description" content="Sign in to your Cloud9 Resume account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <Link href="/">
            <span className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
              Cloud9 Resume
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-light text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Container */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:bg-white focus:border-gray-400"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:bg-white focus:border-gray-400"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 bg-gray-50 border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                Keep me signed in
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <GoogleOAuthButton
              mode="signin"
              onClick={handleGoogleSignIn}
              isLoading={googleLoading}
            />
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default LoginPage