import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Link from 'next/link'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // Pages that don't need navbar/footer (auth pages, etc.)
  const authPages = ['/login', '/signup']
  const isDashboard = router.pathname.startsWith('/dashboard')
  const isAuthPage = authPages.includes(router.pathname)
  
  // Dashboard pages have their own layout
  if (isDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardLayout>
          <Component {...pageProps} />
        </DashboardLayout>
      </div>
    )
  }
  
  // Auth pages don't need navbar/footer
  if (isAuthPage) {
    return <Component {...pageProps} />
  }
  
  // Regular pages with navbar and footer
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  )
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Resume Builder', href: '/dashboard/resume', icon: '📄' },
    { name: 'Portfolio Builder', href: '/dashboard/portfolio', icon: '🎨' },
    { name: 'ATS Checker', href: '/dashboard/ats', icon: '🎯' },
    { name: 'Credits', href: '/dashboard/credits', icon: '⚡' },
  ]
  
  const handleSignOut = () => {
    // TODO: Implement sign out
    router.push('/')
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white shadow">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-bold text-blue-600">Cloud9 Resume</span>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    router.pathname === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    JD
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">John Doe</p>
                  <div className="flex space-x-2 text-xs">
                    <Link href="/profile" className="text-blue-600 hover:text-blue-500">
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}