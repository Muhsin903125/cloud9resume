/**
 * Rate Limiting Utility
 * 
 * Provides IP-based rate limiting for API endpoints to prevent abuse
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
  message?: string; // Custom error message
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limit tracking
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIP(req: any): string {
  // Get IP from various headers (for cases behind proxies)
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const clientIP = req.connection?.remoteAddress || req.socket?.remoteAddress;
  
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || clientIP || 'unknown';
}

export function applyRateLimit(
  req: any,
  res: any,
  config: RateLimitConfig,
  identifier?: string
): boolean {
  const ip = getClientIP(req);
  const key = identifier ? `${identifier}:${ip}` : ip;
  const now = Date.now();
  
  // Get existing rate limit entry or create new one
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return true; // Allow request
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    res.status(429).json({
      success: false,
      error: config.message || 'Too many requests. Please try again later.',
      retryAfter,
    });
    
    console.log(`⚠️ Rate limit exceeded for ${key}: ${entry.count}/${config.maxRequests} requests`);
    return false; // Block request
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return true; // Allow request
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH_SIGNIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  
  AUTH_SIGNUP: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 signups per hour
    message: 'Too many signup attempts. Please try again in 1 hour.',
  },
  
  AUTH_FORGOT_PASSWORD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 password reset requests per hour
    message: 'Too many password reset requests. Please try again in 1 hour.',
  },
  
  AUTH_OAUTH: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10, // 10 OAuth attempts per 10 minutes
    message: 'Too many OAuth attempts. Please try again in 10 minutes.',
  },
  
  // General API endpoints - more lenient
  API_GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Rate limit exceeded. Please try again later.',
  },
} as const;

export function withRateLimit(
  config: RateLimitConfig,
  identifier?: string
) {
  return function rateLimitMiddleware(req: any, res: any, next: () => void) {
    const allowed = applyRateLimit(req, res, config, identifier);
    if (allowed) {
      next();
    }
    // If not allowed, response was already sent by applyRateLimit
  };
}