import { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Button from '../../components/Button'
import { useAuth } from '../../lib/authUtils'
import {
  DocumentIcon,
  SaveIcon,
  ActivityIcon,
  TemplateIcon,
  PortfolioIcon,
  AIIcon,
  AnalyticsIcon,
  ArrowRightIcon
} from '../../components/Icons'

const DashboardPage: NextPage = () => {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [displayName, setDisplayName] = useState<string>('User')
  
  const [stats] = useState({
    resumesCreated: 3,
    portfoliosCreated: 1,
    atsScores: 5,
    creditsRemaining: 75
  })

  // Get display name from user data
  useEffect(() => {
    if (user) {
      // Try to get name in order of preference:
      // 1. user.name (from Google OAuth)
      // 2. user.profile?.first_name (from email auth)
      // 3. Extract from email
      // 4. Default to 'User'
      const name = 
        user.name ||
        user.profile?.first_name ||
        (user.email?.split('@')[0] || 'User')
      
      setDisplayName(name)
    }
  }, [user])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const recentActivity = [
    {
      id: 1,
      type: 'resume',
      title: 'Software Engineer Resume',
      action: 'Updated',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'ats',
      title: 'Marketing Manager Resume',
      action: 'ATS Checked',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'portfolio',
      title: 'Design Portfolio',
      action: 'Created',
      timestamp: '3 days ago'
    }
  ]

  const quickActions = [
    {
      title: 'Create Resume',
      description: 'Build a professional resume',
      href: '/dashboard/resume',
      icon: DocumentIcon
    },
    {
      title: 'Build Portfolio',
      description: 'Showcase your projects',
      href: '/dashboard/portfolio',
      icon: PortfolioIcon
    },
    {
      title: 'ATS Check',
      description: 'Optimize for tracking systems',
      href: '/dashboard/ats',
      icon: AnalyticsIcon
    },
    {
      title: 'Manage Credits',
      description: 'View and refill credits',
      href: '/plans',
      icon: DocumentIcon
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume': return <DocumentIcon size={20} />
      case 'portfolio': return <PortfolioIcon size={20} />
      case 'ats': return <AnalyticsIcon size={20} />
      default: return <ActivityIcon size={20} />
    }
  }

  return (
    <>
      <Head>
        <title>Dashboard - Cloud9 Resume</title>
        <meta name="description" content="Manage your resumes, portfolios, and career tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="bg-white flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6 sticky top-0 z-40 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-semibold text-gray-900">{displayName}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/plans">
                <Button variant="secondary" size="small">
                  Upgrade Plan
                </Button>
              </Link>
               
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8">
            {/* Credits Section */}
            <div className="mb-8 p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-300 text-sm font-medium mb-2">Available Credits</p>
                  <p className="text-5xl font-bold">{user?.profile?.credits || stats.creditsRemaining}</p>
                </div>
                <Link href="/plans">
                  <Button variant="primary" size="small" className="bg-white text-gray-900 hover:bg-gray-100">
                    Buy Credits
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Resumes Created</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.resumesCreated}</p>
                  </div>
                  <DocumentIcon size={32} color="#d1d5db" />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Portfolios</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.portfoliosCreated}</p>
                  </div>
                  <PortfolioIcon size={32} color="#d1d5db" />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">ATS Checks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.atsScores}</p>
                  </div>
                  <AnalyticsIcon size={32} color="#d1d5db" />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Saved Templates</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
                  </div>
                  <TemplateIcon size={32} color="#d1d5db" />
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
                        <div className="mb-4 inline-block group-hover:scale-110 transition-transform text-gray-900">
                          <action.icon size={32} />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {action.description}
                        </p>
                        <div className="flex items-center text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          Get Started <ArrowRightIcon size={16} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                          <span className="text-gray-900 flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {activity.action} • {activity.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard/history">
                    <div className="p-4 bg-gray-50 text-center border-t border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-gray-700">View all activity</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
