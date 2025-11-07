import { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Button from '../../components/Button'
import Card from '../../components/Card'

const PortfolioBuilderPage: NextPage = () => {
  const [portfolios] = useState([
    {
      id: 1,
      title: 'Design Portfolio',
      theme: 'Modern',
      projects: 8,
      lastModified: '1 day ago',
      status: 'Published',
      url: 'https://johndoe.cloud9resume.com'
    },
    {
      id: 2,
      title: 'Development Work',
      theme: 'Dark',
      projects: 12,
      lastModified: '1 week ago',
      status: 'Draft'
    }
  ])

  return (
    <>
      <Head>
        <title>Portfolio Builder - Cloud9 Resume</title>
        <meta name="description" content="Create stunning portfolios to showcase your work" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <nav className="flex space-x-2 text-sm text-gray-600 mb-2">
                  <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
                  <span>/</span>
                  <span className="text-gray-900">Portfolio Builder</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">Portfolio Builder</h1>
                <p className="text-gray-600">Showcase your work with beautiful portfolios</p>
              </div>
              <Button variant="primary">Create New Portfolio</Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <Card key={portfolio.id} className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{portfolio.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {portfolio.projects} projects • {portfolio.theme} theme
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    portfolio.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {portfolio.status}
                  </span>
                  <span className="text-sm text-gray-500">{portfolio.lastModified}</span>
                </div>
                {portfolio.url && (
                  <p className="text-sm text-blue-600 mb-4 truncate">{portfolio.url}</p>
                )}
                <div className="flex space-x-2">
                  <Button variant="primary" size="small">Edit</Button>
                  <Button variant="secondary" size="small">View</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default PortfolioBuilderPage