import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Card from '../components/Card'
import { supabase } from '../lib/supabaseClient'

const HomePage: NextPage = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getUser()

      if (error && error.message !== 'Auth session missing!') {
        setConnectionStatus(`❌ Connection failed: ${error.message}`)
        return
      }

      setConnectionStatus('✅ Frontend Supabase connection successful!')
    } catch (err: any) {
      setConnectionStatus(`❌ Connection error: ${err.message}`)
    }
  }
  const features = [
    {
      title: 'AI Resume Builder',
      description: 'Create professional resumes with AI-powered suggestions and templates.',
      icon: '📄'
    },
    {
      title: 'Portfolio Builder',
      description: 'Showcase your work with beautiful, customizable portfolio layouts.',
      icon: '🎨'
    },
    {
      title: 'ATS Checker',
      description: 'Optimize your resume for Applicant Tracking Systems.',
      icon: '🎯'
    }
  ]

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: ['1 Resume', 'Basic Templates', 'PDF Export'],
      popular: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      features: ['Unlimited Resumes', 'Premium Templates', 'ATS Checker', 'Portfolio Builder'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$29.99',
      features: ['Everything in Pro', 'Team Collaboration', 'Custom Branding', 'Priority Support'],
      popular: false
    }
  ]

  return (
    <>
      <Head>
        <title>Cloud9 Resume - AI-Powered Resume & Portfolio Builder</title>
        <meta name="description" content="Create professional resumes and portfolios with AI assistance. Optimize for ATS and land your dream job." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Connection Test Banner */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-sm text-gray-700">
          <div className="max-w-7xl mx-auto">
            <strong>Supabase Connection Test:</strong> {connectionStatus}
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Build Your Dream Career with{' '}
                <span className="text-blue-600">AI-Powered</span> Resumes
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Create professional resumes, stunning portfolios, and optimize for ATS - all powered by artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button variant="primary" size="large">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button variant="secondary" size="large">
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need to Land Your Dream Job
              </h2>
              <p className="text-lg text-gray-600">
                Powerful tools to create, optimize, and showcase your professional brand.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-8">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-lg text-gray-600">
                Start free, upgrade when you need more features.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`p-8 text-center relative ${
                    plan.popular ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 mb-6">
                    {plan.price}
                    <span className="text-sm text-gray-600 font-normal">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-gray-600">
                        ✓ {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button 
                      variant={plan.popular ? "primary" : "secondary"}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}

export default HomePage