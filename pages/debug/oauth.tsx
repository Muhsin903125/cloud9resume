import { useEffect, useState } from 'react'

export default function DebugOAuth() {
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    setConfig({
      origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
      expectedRedirectUri: `${typeof window !== 'undefined' ? window.location.origin : 'N/A'}/api/auth/callback/linkedin`,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">OAuth Debug Info</h1>

        {config && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h2 className="font-semibold text-lg mb-3">Current Environment:</h2>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="font-bold">Browser Origin:</span>
                  <span className="ml-2 text-blue-600">{config.origin}</span>
                </div>
                <div>
                  <span className="font-bold">NEXT_PUBLIC_APP_URL:</span>
                  <span className="ml-2 text-blue-600">{config.appUrl}</span>
                </div>
                <div>
                  <span className="font-bold">Client ID:</span>
                  <span className="ml-2 text-blue-600">{config.clientId ? '✓ Set' : '✗ Missing'}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h2 className="font-semibold text-lg mb-3">Expected Redirect URI:</h2>
              <div className="font-mono text-sm text-blue-700 break-all">
                {config.expectedRedirectUri}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ⚠️ This must match exactly what's configured in your LinkedIn Developer App Settings
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h2 className="font-semibold text-lg mb-3">Setup Instructions:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <a href="https://www.linkedin.com/developers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Developer Portal</a></li>
                <li>Select your application</li>
                <li>Go to "Settings" → "Authorized redirect URLs"</li>
                <li>Add this exact URL: <code className="bg-gray-200 px-2 py-1 rounded">{config.expectedRedirectUri}</code></li>
                <li>Save and wait a few minutes for changes to propagate</li>
              </ol>
            </div>

            {config.origin !== config.appUrl && (
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <h2 className="font-semibold text-lg mb-2 text-red-700">⚠️ Mismatch Detected!</h2>
                <p className="text-sm text-red-600">
                  Browser origin ({config.origin}) doesn't match NEXT_PUBLIC_APP_URL ({config.appUrl})
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Solution: Update .env.local to match your actual localhost/domain
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}
