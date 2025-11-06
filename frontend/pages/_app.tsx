import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Link from 'next/link'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  DashboardIcon,
  DocumentIcon,
  PaletteIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '../components/Icons'

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
    { name: 'Dashboard', href: '/dashboard', Icon: DashboardIcon },
    { name: 'Resume Builder', href: '/dashboard/resume', Icon: DocumentIcon },
    { name: 'Portfolio Builder', href: '/dashboard/portfolio', Icon: PaletteIcon },
    { name: 'ATS Checker', href: '/dashboard/ats', Icon: CheckCircleIcon },
    { name: 'Credits', href: '/dashboard/credits', Icon: CreditCardIcon },
  ]
  
  const handleSignOut = () => {
    // TODO: Implement sign out
    router.push('/')
  }
  
  return (
    <div className="min-h-screen flex flex-row bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block md:w-64 md:flex-shrink-0 md:border-r md:border-gray-200 md:bg-white md:shadow-sm">
        <div className="flex flex-col h-screen sticky top-0 overflow-y-auto bg-white">
          <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-900">Cloud9</span>
          </div>
          <div className="flex-grow flex flex-col py-6">
            <nav className="flex-1 px-4 space-y-1">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    router.pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.Icon className={`mr-3 w-5 h-5 ${router.pathname === item.href ? 'text-white' : 'text-gray-600'}`} />
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Account</p>
                  <p className="text-xs text-gray-600">View profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  )
}