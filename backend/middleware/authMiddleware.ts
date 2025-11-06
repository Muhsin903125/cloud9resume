// Define basic request/response types for serverless functions
export interface ApiRequest {
  method: string;
  headers: Record<string, string | string[]>;
  body?: any;
  query?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: any): void;
  send(data: any): void;
  end(): void;
}

export interface AuthenticatedRequest extends ApiRequest {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

import { createSupabaseClient } from '../supabaseClient';

export const withAuth = (handler: (req: AuthenticatedRequest, res: ApiResponse) => Promise<void> | void) => {
  return async (req: AuthenticatedRequest, res: ApiResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || (typeof authHeader === 'string' && !authHeader.startsWith('Bearer '))) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header'
        });
      }

      const token = typeof authHeader === 'string' ? authHeader.substring(7) : '';
      const supabase = createSupabaseClient(token);

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email!,
        role: user.user_metadata?.role || 'user'
      };

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Authentication failed'
      });
    }
  };
};

export const withOptionalAuth = (handler: (req: AuthenticatedRequest, res: ApiResponse) => Promise<void> | void) => {
  return async (req: AuthenticatedRequest, res: ApiResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const supabase = createSupabaseClient(token);

        const { data: { user }, error } = await supabase.auth.getUser();

        if (!error && user) {
          req.user = {
            id: user.id,
            email: user.email!,
            role: user.user_metadata?.role || 'user'
          };
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      // Continue without authentication
      return handler(req, res);
    }
  };
};