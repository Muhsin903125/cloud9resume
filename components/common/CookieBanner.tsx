import React, { useState, useEffect } from "react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/rejected cookies
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
    // Here you would trigger analytics pixel like GTM
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "essential_only");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[100] p-4 md:p-6 transition-all transform animate-slide-up">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            We value your privacy
          </h3>
          <p className="text-sm text-gray-600">
            We use cookies to enhance your browsing experience, serve
            personalized content, and analyze our traffic. By clicking "Accept
            All", you consent to our use of cookies.{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Read our Privacy Policy
            </a>
            .
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
