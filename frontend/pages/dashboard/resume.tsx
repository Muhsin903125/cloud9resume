import { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Button from '../../components/Button'
import Card from '../../components/Card'

const ResumeBuilderPage: NextPage = () => {
  const [resumes] = useState([
    {
      id: 1,
      title: 'Software Engineer Resume',
      template: 'Modern',
      lastModified: '2 hours ago',
      status: 'Draft'
    },
    {
      id: 2,
      title: 'Senior Developer Resume',
      template: 'Professional',
      lastModified: '1 day ago',
      status: 'Complete'
    },
    {
      id: 3,
      title: 'Frontend Specialist Resume',
      template: 'Creative',
      lastModified: '3 days ago',
      status: 'Complete'
    }
  ])

  const templates = [
    {
      id: 1,
      name: 'Modern',
      description: 'Clean and contemporary design perfect for tech roles',
      preview: '/templates/modern-preview.jpg',
      category: 'Professional'
    },
    {
      id: 2,
      name: 'Creative',
      description: 'Bold design for creative and design positions',
      preview: '/templates/creative-preview.jpg',
      category: 'Creative'
    },
    {
      id: 3,
      name: 'Executive',
      description: 'Sophisticated layout for senior leadership roles',
      preview: '/templates/executive-preview.jpg',
      category: 'Executive'
    },
    {
      id: 4,
      name: 'Minimalist',
      description: 'Simple and elegant design that highlights content',
      preview: '/templates/minimalist-preview.jpg',
      category: 'Professional'
    }
  ]

  const handleCreateNew = () => {
    // TODO: Navigate to resume editor
    console.log('Creating new resume...')
  }

  const handleEditResume = (resumeId: number) => {
    // TODO: Navigate to resume editor with existing resume
    console.log('Editing resume:', resumeId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800'
      case 'Draft': return 'bg-yellow-100 text-yellow-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Head>
        <title>Resume Builder - Cloud9 Resume</title>
        <meta name="description" content="Create and manage your professional resumes with AI assistance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <nav className="flex space-x-2 text-sm text-gray-600 mb-2">
                  <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
                  <span>/</span>
                  <span className="text-gray-900">Resume Builder</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
                <p className="text-gray-600">Create professional resumes with AI-powered assistance</p>
              </div>
              <Button onClick={handleCreateNew} variant="primary">
                Create New Resume
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* My Resumes Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Resumes</h2>
            {resumes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{resume.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(resume.status)}`}>
                        {resume.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Template: {resume.template}</p>
                    <p className="text-sm text-gray-500 mb-4">Last modified: {resume.lastModified}</p>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditResume(resume.id)}
                        variant="primary"
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button variant="secondary" size="small">
                        Download
                      </Button>
                      <Button variant="secondary" size="small">
                        Share
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                <p className="text-gray-600 mb-6">Create your first professional resume to get started</p>
                <Button onClick={handleCreateNew} variant="primary">
                  Create Your First Resume
                </Button>
              </Card>
            )}
          </div>

          {/* Templates Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose a Template</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-gray-500">Template Preview</span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <Button
                      onClick={() => {
                        // TODO: Start creating resume with this template
                        console.log('Using template:', template.name)
                      }}
                      variant="secondary"
                      size="small"
                      className="w-full"
                    >
                      Use Template
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Info */}
          <div className="mt-12">
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume Builder Features</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">AI Assistance</h3>
                  <p className="text-sm text-gray-600">Get intelligent suggestions for content and formatting</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">ATS Optimized</h3>
                  <p className="text-sm text-gray-600">Templates designed to pass applicant tracking systems</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Industry Specific</h3>
                  <p className="text-sm text-gray-600">Templates tailored for different industries and roles</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResumeBuilderPage