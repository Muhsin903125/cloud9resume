// Color palette
export const colors = {
  primary: {
    black: '#000000',
    gray: '#666666',
    blue: '#3b82f6',
  },
  secondary: {
    lightGray: '#f3f4f6',
    mediumGray: '#9ca3af',
    darkGray: '#1f2937',
  },
  accent: {
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
  },
  border: '#e5e7eb',
  background: {
    white: '#ffffff',
    light: '#f9fafb',
    dark: '#111827',
  },
}

// Breakpoints
export const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
}

// Media queries
export const media = {
  mobile: `(min-width: ${breakpoints.mobile}px)`,
  tablet: `(min-width: ${breakpoints.tablet}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
  wide: `(min-width: ${breakpoints.wide}px)`,
}

// Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
}

// Spacing
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
}

// Font sizes
export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
}

// Z-index layers
export const zIndex = {
  base: 1,
  dropdown: 10,
  modal: 100,
  tooltip: 1000,
}
