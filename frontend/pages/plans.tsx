import { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Card from '../components/Card'

const PlansPage: NextPage = () => {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        '1 Resume template',
        'Basic PDF export',
        'Basic editing tools',
        'Community support'
      ],
      limitations: [
        'Limited customization',
        'Watermark on downloads',
        'Basic templates only'
      ],
      popular: false,
      cta: 'Get Started Free'
    },
    {
      name: 'Pro',
      description: 'For serious job seekers',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: [
        'Unlimited resumes',
        'Premium templates',
        'AI-powered suggestions',
        'ATS optimization checker',
        'Portfolio builder',
        'Cover letter generator',
        'Priority support',
        'No watermarks'
      ],
      limitations: [],
      popular: true,
      cta: 'Start Pro Trial'
    },
    {
      name: 'Enterprise',
      description: 'For teams and organizations',
      monthlyPrice: 29.99,
      annualPrice: 299.99,
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom branding',
        'Advanced analytics',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'SSO authentication'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales'
    }
  ]

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Free') {
      router.push('/signup')
    } else if (planName === 'Enterprise') {
      // Open contact form or external link
      window.open('mailto:sales@cloud9resume.com?subject=Enterprise Plan Inquiry', '_blank')
    } else {
      router.push(`/signup?plan=${planName.toLowerCase()}`)
    }
  }

  const getCurrentPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0
    const annualTotal = plan.monthlyPrice * 12
    const savings = annualTotal - plan.annualPrice
    return Math.round((savings / annualTotal) * 100)
  }

  return (
    <>
      <Head>
        <title>Pricing Plans - Cloud9 Resume</title>
        <meta name="description" content="Choose the perfect plan for your career needs. Start free or upgrade for premium features." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        <Navbar />
        
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Start building your professional brand today. Upgrade anytime as your needs grow.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center space-x-4">
                <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${billingCycle === 'annual' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Annual
                </span>
                <span className="text-sm text-green-600 font-medium">Save up to 17%</span>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {plans.map((plan, index) => (
                <Card 
                  key={index}
                  className={`relative p-8 ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        ${getCurrentPrice(plan)}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-gray-600">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                      {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          Save {getSavings(plan)}% annually
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handlePlanSelect(plan.name)}
                      variant={plan.popular ? 'primary' : 'secondary'}
                      className="w-full mb-8"
                    >
                      {plan.cta}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Features included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start">
                              <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-600">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I change plans anytime?
                  </h3>
                  <p className="text-gray-600">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Is there a free trial for Pro plans?
                  </h3>
                  <p className="text-gray-600">
                    Yes, we offer a 14-day free trial for all Pro plans. No credit card required to start your trial.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-gray-600">
                    We accept all major credit cards, PayPal, and bank transfers for annual plans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default PlansPage