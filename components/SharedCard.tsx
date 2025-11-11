import React from 'react'
import { colors, transitions } from '../lib/constants'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const SharedCard: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = false,
  padding = 'md'
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const paddingStyles: Record<string, string> = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  }

  const baseStyles: React.CSSProperties = {
    backgroundColor: colors.background.white,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    padding: paddingStyles[padding],
    transition: transitions.normal,
    cursor: onClick ? 'pointer' : 'default',
  }

  const hoverStyles: React.CSSProperties = hover || onClick ? {
    boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
  } : {}

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...hoverStyles,
  }

  return (
    <div
      style={combinedStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  )
}

export default SharedCard
