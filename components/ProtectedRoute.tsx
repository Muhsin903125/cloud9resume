import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/authUtils";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks for authentication using the main auth system
 * If not authenticated, redirects to login with returnUrl
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Still loading auth state
    
    setHasChecked(true);
    
    if (!isAuthenticated) {
      // Store return URL for redirect after login
      const returnUrl = router.asPath;
      const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`;
      router.replace(loginUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  }, [isAuthenticated, isLoading, router, redirectTo]);

  // While checking authentication, show loading
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - will redirect (don't render anything)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - render children
  return <>{children}</>;
}

export default ProtectedRoute;
