import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Card from '../components/Card'
import { supabase } from '../lib/supabaseClient'
import { DocumentIcon, PaletteIcon, CheckCircleIcon } from '../components/Icons'

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
      icon: DocumentIcon
    },
    {
      title: 'Portfolio Builder',
      description: 'Showcase your work with beautiful, customizable portfolio layouts.',
      icon: PaletteIcon
    },
    {
      title: 'ATS Checker',
      description: 'Optimize your resume for Applicant Tracking Systems.',
      icon: CheckCircleIcon
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
        <section className="pt-32 pb-24 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
                Your Career,{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                Create stunning resumes, beautiful portfolios, and optimize for ATS—all powered by AI. Land your dream job faster.
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
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful tools designed to help you create, optimize, and showcase your professional brand.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <Card key={index} className="p-8 hover:shadow-lg transition-shadow duration-300">
                    <div className="mb-6">
                      <IconComponent className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Start free and upgrade when you're ready. No hidden fees, cancel anytime.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`p-8 flex flex-col relative transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-blue-600 shadow-xl scale-105' : 'hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className={plan.popular ? 'mt-2' : ''}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 font-medium">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-gray-700">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block">
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