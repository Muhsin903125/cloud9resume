import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  children: ReactNode
}

export default function Button({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-black hover:shadow-md focus:ring-gray-700',
    secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus:ring-red-500'
  }
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2.5 text-sm',
    large: 'px-6 py-3 text-base'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}