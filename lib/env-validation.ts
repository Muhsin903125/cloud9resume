/**
 * Environment Variable Validation
 * 
 * Validates required environment variables on application startup
 * to prevent runtime errors and security issues
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // JWT Authentication  
  JWT_SECRET: string;
  TOKEN_EXPIRY: string;
  
  // OAuth
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NEXT_PUBLIC_LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
  NEXT_PUBLIC_GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  
  // Email
  FROM_EMAIL: string;
  RESEND_API_KEY: string;
  
  // Payments
  DODO_PAYMENTS_API_KEY: string;
  DODO_PAYMENTS_WEBHOOK_KEY: string;
  
  // Optional but recommended
  GEMINI_API_KEY?: string;
  NEXT_PUBLIC_GA_ID?: string;
}

const REQUIRED_ENV_VARS: (keyof EnvConfig)[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'TOKEN_EXPIRY',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'NEXT_PUBLIC_GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'FROM_EMAIL',
  'RESEND_API_KEY',
  'DODO_PAYMENTS_API_KEY',
  'DODO_PAYMENTS_WEBHOOK_KEY',
];

const SECURITY_CHECKS = {
  JWT_SECRET: {
    minLength: 32,
    disallowedValues: [
      'your-super-secret-key-minimum-32-characters-change-in-prod',
      'your-secret-key',
      'secret',
      'change-me'
    ]
  }
};

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for missing required environment variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Security checks
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    // Check JWT secret length
    if (jwtSecret.length < SECURITY_CHECKS.JWT_SECRET.minLength) {
      errors.push(`JWT_SECRET must be at least ${SECURITY_CHECKS.JWT_SECRET.minLength} characters long`);
    }
    
    // Check for insecure default values
    if (SECURITY_CHECKS.JWT_SECRET.disallowedValues.includes(jwtSecret)) {
      errors.push('JWT_SECRET is using an insecure default value. Please generate a secure random secret.');
    }
  }
  
  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z]+\.supabase\.co$/)) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL format appears invalid. Expected: https://[project].supabase.co');
  }
  
  // Validate email format
  const fromEmail = process.env.FROM_EMAIL;
  if (fromEmail && !fromEmail.match(/^.+<.+@.+\..+>$|^.+@.+\..+$/)) {
    errors.push('FROM_EMAIL format appears invalid. Expected: "Name <email@domain.com>" or "email@domain.com"');
  }
  
  return { 
    isValid: errors.length === 0, 
    errors 
  };
}

export function logEnvironmentStatus() {
  if (typeof window !== 'undefined') {
    // Only run on server-side
    return;
  }
  
  const { isValid, errors } = validateEnvironment();
  
  if (isValid) {
    console.log('✅ Environment validation passed');
  } else {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    } else {
      console.error('⚠️  Application may not function correctly with invalid environment configuration');
    }
  }
}

// Auto-validate on import (server-side only)
if (typeof window === 'undefined') {
  logEnvironmentStatus();
}