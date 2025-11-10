import React, { useState } from 'react'
import { useRouter } from 'next/router'

interface OAuthButtonProps {
  provider: 'google' | 'linkedin' | 'github'
  mode: 'signin' | 'signup'
  text?: string
  className?: string
  getOAuthUrl: () => string
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: '🔍',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    borderColor: 'border border-gray-300',
    hoverColor: 'hover:bg-gray-50',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border border-blue-700',
    hoverColor: 'hover:bg-blue-700',
  },
  github: {
    name: 'GitHub',
    icon: '⚙️',
    bgColor: 'bg-gray-800',
    textColor: 'text-white',
    borderColor: 'border border-gray-900',
    hoverColor: 'hover:bg-gray-900',
  },
}

export default function OAuthButton({
  provider,
  mode,
  text,
  className = '',
  getOAuthUrl,
}: OAuthButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const config = providerConfig[provider]
  const buttonText = text || `${mode === 'signin' ? 'Sign in' : 'Sign up'} with ${config.name}`

  const handleClick = () => {
    try {
      setIsLoading(true)
      const oauthUrl = getOAuthUrl()
      window.location.href = oauthUrl
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      setIsLoading(false)
      router.push(`/${mode}?error=OAuth+initialization+failed`)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        w-full py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2
        ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.hoverColor}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <span>{config.icon}</span>
      <span>{isLoading ? 'Redirecting...' : buttonText}</span>
    </button>
  )
}
