import React from 'react'
import { colors, transitions } from '../lib/constants'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  className?: string
}

const SharedButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    borderRadius: '0.375rem',
    transition: transitions.normal,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    fontFamily: 'inherit',
    width: fullWidth ? '100%' : 'auto',
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.625rem 1.25rem', fontSize: '1rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary.blue,
      color: colors.background.white,
    },
    secondary: {
      backgroundColor: colors.primary.gray,
      color: colors.background.white,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary.black,
      border: `1px solid ${colors.border}`,
    },
  }

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#2563eb' },
    secondary: { backgroundColor: '#4b5563' },
    ghost: { backgroundColor: colors.secondary.lightGray },
  }

  const [isHovered, setIsHovered] = React.useState(false)

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled ? hoverStyles[variant] : {}),
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={combinedStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  )
}

export default SharedButton
