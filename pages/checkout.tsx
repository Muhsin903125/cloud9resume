import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initiateDodoCheckout } from "../lib/plansUtils";
import { useAuth } from "../lib/authUtils";

const CheckoutPage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Wait for auth to load and router to be ready
    if (authLoading || !router.isReady) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Extract query params
    const { productId, planId } = router.query;

    if (!productId || !planId) {
      setError(
        "Missing payment information. Please try again from the plans page."
      );
      return;
    }

    // Initiate checkout automatically
    const initiateCheckout = async () => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        const result = await initiateDodoCheckout(
          productId as string,
          planId as string
        );

        if (result.error) {
          setError(result.error);
        } else if (result.data?.url) {
          // Redirect to payment page
          window.location.href = result.data.url;
        } else {
          setError("Failed to generate checkout link. Please try again.");
        }
      } catch (err) {
        console.error("Checkout error:", err);
        setError("An error occurred while processing your request.");
      } finally {
        setIsProcessing(false);
      }
    };

    initiateCheckout();
  }, [
    router.isReady,
    router.query,
    router.asPath,
    isAuthenticated,
    authLoading,
    isProcessing,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          {error ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Payment Error
              </h2>
              <p className="text-red-300 text-center mb-6">{error}</p>
              <button
                onClick={() => router.push("/plans")}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Return to Plans
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                <svg
                  className="w-8 h-8 text-blue-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Redirecting to Payment
              </h2>
              <p className="text-slate-300 text-center">
                Please wait while we prepare your checkout session...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
