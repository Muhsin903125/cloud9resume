import { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Button from '../../components/Button'
import Card from '../../components/Card'

const DashboardPage: NextPage = () => {
  const [stats] = useState({
    resumesCreated: 3,
    portfoliosCreated: 1,
    atsScores: 5,
    creditsRemaining: 75
  })

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
      title: 'Create New Resume',
      description: 'Start building a professional resume with AI assistance',
      href: '/dashboard/resume',
      icon: '📄',
      color: 'bg-blue-500'
    },
    {
      title: 'Build Portfolio',
      description: 'Showcase your work with a stunning portfolio',
      href: '/dashboard/portfolio',
      icon: '🎨',
      color: 'bg-purple-500'
    },
    {
      title: 'Check ATS Score',
      description: 'Optimize your resume for applicant tracking systems',
      href: '/dashboard/ats',
      icon: '🎯',
      color: 'bg-green-500'
    },
    {
      title: 'Manage Credits',
      description: 'View usage and refill your credits',
      href: '/dashboard/credits',
      icon: '⚡',
      color: 'bg-yellow-500'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume': return '📄'
      case 'portfolio': return '🎨'
      case 'ats': return '🎯'
      default: return '📋'
    }
  }

  return (
    <>
      <Head>
        <title>Dashboard - Cloud9 Resume</title>
        <meta name="description" content="Manage your resumes, portfolios, and career tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your career tools.</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Credits: <span className="font-semibold text-blue-600">{stats.creditsRemaining}</span>
                </span>
                <Link href="/dashboard/credits">
                  <Button variant="secondary" size="small">
                    Refill Credits
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📄</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resumes Created</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resumesCreated}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🎨</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Portfolios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.portfoliosCreated}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ATS Checks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.atsScores}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Credits Left</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.creditsRemaining}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-lg">{action.icon}</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.action} • {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link href="/dashboard/history">
                    <Button variant="secondary" size="small" className="w-full">
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage