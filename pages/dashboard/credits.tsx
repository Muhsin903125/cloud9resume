import { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Button from '../../components/Button'
import Card from '../../components/Card'

const CreditsPage: NextPage = () => {
  const [creditStats] = useState({
    current: 75,
    used: 25,
    total: 100,
    resetDate: '2024-12-06'
  })

  const usage = [
    { action: 'Resume Generated', credits: 5, date: '2024-11-06', time: '2:30 PM' },
    { action: 'ATS Check', credits: 2, date: '2024-11-05', time: '4:15 PM' },
    { action: 'Portfolio Created', credits: 10, date: '2024-11-04', time: '10:20 AM' },
    { action: 'Resume Template', credits: 3, date: '2024-11-03', time: '1:45 PM' }
  ]

  const creditPacks = [
    {
      name: 'Starter Pack',
      credits: 50,
      price: 9.99,
      popular: false
    },
    {
      name: 'Professional Pack',
      credits: 150,
      price: 24.99,
      popular: true,
      savings: 'Save 17%'
    },
    {
      name: 'Enterprise Pack',
      credits: 300,
      price: 49.99,
      popular: false,
      savings: 'Save 25%'
    }
  ]

  return (
    <>
      <Head>
        <title>Credits Management - Cloud9 Resume</title>
        <meta name="description" content="Manage your credits and view usage history" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <nav className="flex space-x-2 text-sm text-gray-600 mb-2">
                <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
                <span>/</span>
                <span className="text-gray-900">Credits</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">Credits Management</h1>
              <p className="text-gray-600">Monitor your usage and purchase additional credits</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Credit Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{creditStats.current}</div>
              <p className="text-gray-600">Credits Remaining</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{creditStats.used}</div>
              <p className="text-gray-600">Credits Used This Month</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{creditStats.total}</div>
              <p className="text-gray-600">Monthly Allocation</p>
              <p className="text-sm text-gray-500 mt-1">Resets on {creditStats.resetDate}</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Purchase Credits */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Purchase Additional Credits</h2>
              <div className="space-y-4">
                {creditPacks.map((pack, index) => (
                  <Card key={index} className={`p-6 ${pack.popular ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{pack.name}</h3>
                          {pack.popular && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{pack.credits} credits</p>
                        {pack.savings && (
                          <p className="text-sm text-green-600 font-medium">{pack.savings}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${pack.price}</div>
                        <Button variant={pack.popular ? 'primary' : 'secondary'} size="small">
                          Purchase
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Usage History */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Usage</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  {usage.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.action}</p>
                        <p className="text-sm text-gray-500">{item.date} at {item.time}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-red-600">-{item.credits}</span>
                        <p className="text-xs text-gray-500">credits</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button variant="secondary" className="w-full">
                    View Full History
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Credit System Info */}
          <div className="mt-12">
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">How Credits Work</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Resume Generation</h3>
                  <p className="text-sm text-gray-600">5 credits per resume</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">ATS Check</h3>
                  <p className="text-sm text-gray-600">2 credits per check</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Portfolio Creation</h3>
                  <p className="text-sm text-gray-600">10 credits per portfolio</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Template Access</h3>
                  <p className="text-sm text-gray-600">3 credits per premium template</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreditsPage