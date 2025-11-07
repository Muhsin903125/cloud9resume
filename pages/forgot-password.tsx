import { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Button from '../components/Button'
import { forgotPassword, validateEmail, isValidEmail } from '../lib/authUtils'

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailValidating, setEmailValidating] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)

  // Validate email when it changes
  useEffect(() => {
    const validateEmailAsync = async () => {
      const trimmedEmail = email.trim()
      
      if (!trimmedEmail) {
        setEmailError('')
        setEmailExists(null)
        return
      }

      // First check format
      if (!isValidEmail(trimmedEmail)) {
        setEmailError('Invalid email format')
        setEmailExists(false)
        return
      }

      // Then check if user exists
      setEmailValidating(true)
      setEmailError('')
      
      try {
        const result = await validateEmail(trimmedEmail)
        
        if (result.data?.exists) {
          setEmailError('')
          setEmailExists(true)
        } else {
          setEmailError('No account found with this email')
          setEmailExists(false)
        }
      } catch (err) {
        console.error('Email validation error:', err)
        // Don't block submission if validation fails
        setEmailError('')
        setEmailExists(null)
      } finally {
        setEmailValidating(false)
      }
    }

    // Debounce the validation
    const timer = setTimeout(validateEmailAsync, 500)
    return () => clearTimeout(timer)
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Email validation
    if (!isValidEmail(email)) {
      setError('Invalid email format')
      setIsLoading(false)
      return
    }

    if (emailExists === false) {
      setError(emailError || 'Email not found')
      setIsLoading(false)
      return
    }

    try {
      const result = await forgotPassword(email)

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Forgot password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password - Cloud9 Resume</title>
        <meta name="description" content="Reset your Cloud9 Resume account password" />
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
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form Container */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {success ? (
            <div className="rounded-lg bg-green-50 p-6 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Check your email
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>We've sent a password reset link to your email. Please check your inbox and follow the instructions.</p>
                  </div>
                  <div className="mt-4">
                    <Link href="/login">
                      <Button variant="secondary" className="w-full">
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:bg-white ${
                      emailError 
                        ? 'border-red-300 focus:border-red-500' 
                        : emailExists === true 
                        ? 'border-green-300 focus:border-green-500' 
                        : 'border-gray-200 focus:border-gray-400'
                    }`}
                    placeholder="you@example.com"
                  />
                  {emailValidating && (
                    <div className="absolute right-3 top-3.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!emailValidating && emailExists === true && (
                    <div className="absolute right-3 top-3.5 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!emailValidating && emailError && (
                    <div className="absolute right-3 top-3.5 text-red-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
                {emailExists === true && email && (
                  <p className="mt-1 text-sm text-green-600">Account found</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage
