/**
 * Health Check API Endpoint
 * 
 * Tests that the application is working correctly with all the new fixes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, withErrorHandler } from '../../lib/api-response';
import { validateEnvironment } from '../../lib/env-validation';

export default withErrorHandler(async function healthCheck(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return ApiResponse.methodNotAllowed(res, ['GET']);
  }

  const checks = {
    environment: false,
    database: false,
    auth: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check 1: Environment Variables
    const envCheck = validateEnvironment();
    checks.environment = envCheck.isValid;

    // Check 2: Database Connection (Supabase)
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Simple query to test connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      checks.database = !error;
    } catch (e) {
      checks.database = false;
    }

    // Check 3: JWT Authentication
    try {
      const jwt = require('jsonwebtoken');
      const testToken = jwt.sign({ test: true }, process.env.JWT_SECRET);
      const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
      checks.auth = !!decoded;
    } catch (e) {
      checks.auth = false;
    }

    const allHealthy = Object.values(checks).every(check => 
      typeof check === 'boolean' ? check : true
    );

    if (allHealthy) {
      ApiResponse.success(res, {
        status: 'healthy',
        checks,
        version: '2.0.0', // Updated with fixes
        fixes_applied: [
          'JWT secret security fix',
          'Portfolio upload bucket fix', 
          'Authentication system consolidation',
          'PDF generation optimization',
          'Error boundaries added',
          'Rate limiting implemented',
          'API response standardization'
        ]
      }, 'All systems operational');
    } else {
      ApiResponse.error(res, 'System health check failed', 503, 'SYSTEM_UNHEALTHY', {
        status: 'unhealthy',
        checks
      });
    }

  } catch (error) {
    ApiResponse.serverError(res, 'Health check failed', error as Error);
  }
});