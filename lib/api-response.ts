/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response formats and error handling for all API endpoints
 */

import { NextApiResponse } from 'next';

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export class ApiResponse {
  /**
   * Send success response with data
   */
  static success<T = any>(
    res: NextApiResponse, 
    data?: T, 
    message?: string,
    statusCode: number = 200
  ): void {
    const response: StandardApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: NextApiResponse,
    message: string,
    statusCode: number = 400,
    code?: string,
    data?: any
  ): void {
    const response: StandardApiResponse = {
      success: false,
      error: message,
      code,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    // Log server errors (500+)
    if (statusCode >= 500) {
      console.error('API Error:', {
        message,
        code,
        statusCode,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: NextApiResponse,
    errors: string[] | string,
    statusCode: number = 422
  ): void {
    const message = Array.isArray(errors) ? errors.join(', ') : errors;
    
    ApiResponse.error(res, `Validation failed: ${message}`, statusCode, 'VALIDATION_ERROR', {
      errors: Array.isArray(errors) ? errors : [errors],
    });
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: NextApiResponse,
    message: string = 'Authentication required'
  ): void {
    ApiResponse.error(res, message, 401, 'UNAUTHORIZED');
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: NextApiResponse,
    message: string = 'Access denied'
  ): void {
    ApiResponse.error(res, message, 403, 'FORBIDDEN');
  }

  /**
   * Send not found response
   */
  static notFound(
    res: NextApiResponse,
    message: string = 'Resource not found'
  ): void {
    ApiResponse.error(res, message, 404, 'NOT_FOUND');
  }

  /**
   * Send method not allowed response
   */
  static methodNotAllowed(
    res: NextApiResponse,
    allowedMethods: string[] = []
  ): void {
    if (allowedMethods.length > 0) {
      res.setHeader('Allow', allowedMethods.join(', '));
    }
    
    ApiResponse.error(
      res, 
      `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`, 
      405, 
      'METHOD_NOT_ALLOWED'
    );
  }

  /**
   * Send rate limit exceeded response
   */
  static rateLimitExceeded(
    res: NextApiResponse,
    retryAfter?: number
  ): void {
    if (retryAfter) {
      res.setHeader('Retry-After', retryAfter.toString());
    }
    
    ApiResponse.error(res, 'Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
  }

  /**
   * Send server error response
   */
  static serverError(
    res: NextApiResponse,
    message: string = 'Internal server error',
    error?: Error
  ): void {
    // Log the full error details for debugging
    if (error) {
      console.error('Server Error Details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }

    // Don't expose internal error details to client in production
    const clientMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : message;

    ApiResponse.error(res, clientMessage, 500, 'INTERNAL_SERVER_ERROR');
  }

  /**
   * Send paginated response
   */
  static paginated<T = any>(
    res: NextApiResponse,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): void {
    const response: StandardApiResponse<T[]> = {
      success: true,
      data,
      message,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  }
}

/**
 * JWT Token extraction utility
 */
export function extractUserIdFromToken(authHeader?: string): string | null {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Import jwt at runtime to avoid bundling issues
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token) as any;

    if (!decoded) {
      return null;
    }

    // Support both standard JWT format (sub) and custom format (userId)
    return decoded.sub || decoded.userId || null;
  } catch (error) {
    console.error('Token extraction error:', error);
    return null;
  }
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler(
  handler: (req: any, res: NextApiResponse) => Promise<void>
) {
  return async (req: any, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Handler Error:', error);
      
      if (!res.headersSent) {
        ApiResponse.serverError(res, 'An unexpected error occurred', error as Error);
      }
    }
  };
}