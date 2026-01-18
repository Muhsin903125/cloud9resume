import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/router";
import { hasValidToken } from "../lib/auth-utils";
import { clearAllTokens } from "../lib/token-keys";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks for valid access token
 * If token is missing/invalid, redirects to login with returnUrl
 *
 * Usage:
 * <ProtectedRoute redirectTo="/login">
 *   <YourComponent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if access token exists and is valid (not expired)
    const isValid = hasValidToken();

    if (!isValid) {
      // No valid token - clear any stored data and redirect to login with returnUrl
      clearAllTokens();
      const returnUrl = router.asPath;
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setIsAuthenticated(true);
  }, [router, redirectTo]);

  // While checking authentication, show nothing
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - render children
  return <>{children}</>;
}

export default ProtectedRoute;
