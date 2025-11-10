import { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Button from '../components/Button'
import Card from '../components/Card'
import OAuthButton from '../components/OAuthButton'
import { api } from '../lib/api'
import { 
  validateEmail, 
  isValidEmail, 
  getGoogleOAuthUrl,
  getLinkedInOAuthUrl,
  getGitHubOAuthUrl
} from '../lib/authUtils'

const SignupPage: NextPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailValidating, setEmailValidating] = useState(false)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)

  // Check for errors from OAuth callback
  useEffect(() => {
    if (router.query.error) {
      const errorMsg = Array.isArray(router.query.error) 
        ? router.query.error[0] 
        : router.query.error
      setError(decodeURIComponent(errorMsg))
      
      // Clear error from URL
      window.history.replaceState({}, '', '/signup')
    }
  }, [router.query.error])

  // Validate email when it changes
  useEffect(() => {
    const validateEmailAsync = async () => {
      const email = formData.email.trim()
      
      if (!email) {
        setEmailError('')
        setEmailValid(null)
        return
      }

      // First check format
      if (!isValidEmail(email)) {
        setEmailError('Invalid email format')
        setEmailValid(false)
        return
      }

      // Then check if user already exists
      setEmailValidating(true)
      setEmailError('')
      
      try {
        const result = await validateEmail(email)
        
        if (result.data?.exists) {
          setEmailError('This email is already registered')
          setEmailValid(false)
        } else {
          setEmailError('')
          setEmailValid(true)
        }
      } catch (err) {
        console.error('Email validation error:', err)
        // Don't block submission if validation fails
        setEmailError('')
        setEmailValid(null)
      } finally {
        setEmailValidating(false)
      }
    }

    // Debounce the validation
    const timer = setTimeout(validateEmailAsync, 500)
    return () => clearTimeout(timer)
  }, [formData.email])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Email validation
    if (!isValidEmail(formData.email)) {
      setError('Invalid email format')
      setIsLoading(false)
      return
    }

    if (emailValid === false) {
      setError(emailError || 'Invalid email')
      setIsLoading(false)
      return
    }

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions')
      setIsLoading(false)
      return
    }

    try {
      const response = await api.signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        acceptTerms: true // Assuming terms are accepted in the form
      })

      if (!response.success) {
        setError(response.error || 'Failed to create account')
        return
      }

      // Show success message and redirect to login or dashboard
      alert('Account created successfully! Please check your email to verify your account.')
      router.push('/login')
    } catch (err) {
      setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    // This is now handled by OAuthButton component
    window.location.href = getGoogleOAuthUrl('signup')
  }

  return (
    <>
      <Head>
        <title>Sign Up - Cloud9 Resume</title>
        <meta name="description" content="Create your Cloud9 Resume account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src="/logo-icon.png"
                alt="Cloud9 Resume Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-blue-600">
                Cloud9 Resume
              </span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 ${
                      emailError 
                        ? 'border-red-300 focus:border-red-500' 
                        : emailValid === true 
                        ? 'border-green-300 focus:border-green-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter your email"
                  />
                  {emailValidating && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!emailValidating && emailValid === true && (
                    <div className="absolute right-3 top-2.5 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!emailValidating && emailError && (
                    <div className="absolute right-3 top-2.5 text-red-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
                {emailValid === true && formData.email && (
                  <p className="mt-1 text-sm text-green-600">Email is available</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <OAuthButton
                  provider="google"
                  mode="signup"
                  getOAuthUrl={() => getGoogleOAuthUrl('signup')}
                />
                <OAuthButton
                  provider="linkedin"
                  mode="signup"
                  getOAuthUrl={() => getLinkedInOAuthUrl('signup')}
                />
                <OAuthButton
                  provider="github"
                  mode="signup"
                  getOAuthUrl={() => getGitHubOAuthUrl('signup')}
                />
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}

export default SignupPage