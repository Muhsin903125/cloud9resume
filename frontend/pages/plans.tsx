import { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Card from '../components/Card'
import { fetchPlans, Plan, addCredits } from '../lib/plansUtils'
import { useAuth } from '../lib/authUtils'
import { CheckIcon } from '../components/Icons'

const PlansPage: NextPage = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [enterprise, setEnterprise] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Fetch plans on mount
  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true)
      setError('')
      try {
        const result = await fetchPlans()
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setPlans(result.data.data || [])
          if (result.data.enterprise) {
            setEnterprise(result.data.enterprise)
          }
        }
      } catch (err) {
        setError('Failed to load plans')
        console.error('Load plans error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlans()
  }, [])

  const handleSelectPlan = async (plan: Plan) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // For free plan, just redirect to dashboard
    if (plan.id === 'free') {
      router.push('/dashboard')
      return
    }

    setLoadingPlanId(plan.id)
    try {
      // Add credits to user account
      const result = await addCredits(plan.credits, plan.id)

      if (result.error) {
        setError(result.error)
      } else {
        // Show success and redirect
        alert(`Successfully upgraded to ${plan.displayName}! ${plan.credits} credits added to your account.`)
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Failed to upgrade plan')
      console.error('Upgrade error:', err)
    } finally {
      setLoadingPlanId(null)
    }
  }

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@cloud9resume.com?subject=Enterprise Plan Inquiry'
  }

  return (
    <>
      <Head>
        <title>Plans & Pricing - Cloud9 Resume</title>
        <meta name="description" content="Choose the perfect plan for your career growth" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your career growth. Start free or upgrade anytime.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-sm mb-8 max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Plans Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                      plan.isPopular 
                        ? 'border-gray-900 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.isPopular ? 'md:scale-105 md:shadow-xl' : ''}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 inset-x-0 bg-gray-900 text-white py-1 text-center">
                        <span className="text-xs font-semibold tracking-wide">MOST POPULAR</span>
                      </div>
                    )}

                    <div className={`p-8 ${plan.isPopular ? 'pt-12' : ''} bg-white`}>
                      <div className="mb-8">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          {plan.displayName}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="mb-8 pb-8 border-b border-gray-200">
                        {plan.price > 0 ? (
                          <div>
                            <div className="flex items-baseline">
                              <span className="text-5xl font-semibold text-gray-900">
                                ${plan.price}
                              </span>
                              <span className="text-gray-600 ml-3 text-sm">
                                /{plan.billingPeriod === 'monthly' ? 'month' : 'year'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-4xl font-semibold text-gray-900">
                            Free
                          </div>
                        )}
                        <div className="mt-3 text-sm font-semibold text-gray-700">
                          {plan.credits} Credits
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button
                        variant={plan.isPopular ? 'primary' : 'secondary'}
                        className="w-full mb-8"
                        disabled={loadingPlanId === plan.id}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        {loadingPlanId === plan.id
                          ? 'Processing...'
                          : plan.id === 'free'
                          ? 'Get Started'
                          : 'Choose Plan'}
                      </Button>

                      {/* Features */}
                      <div className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start">
                            <CheckIcon className="w-5 h-5 text-gray-900 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enterprise Card */}
              {enterprise && (
                <div className="max-w-2xl mx-auto mb-16">
                  <div className="rounded-xl border-2 border-gray-900 bg-white p-8 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between gap-8">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          {enterprise.displayName}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {enterprise.description}
                        </p>
                        <ul className="space-y-2 mb-6">
                          {enterprise.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckIcon className="w-5 h-5 text-gray-900 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-600">
                          + {Math.max(0, enterprise.features.length - 4)} more features
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="primary"
                          onClick={handleContactSales}
                          className="whitespace-nowrap"
                        >
                          Contact Sales
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              <div className="max-w-3xl mx-auto mt-24">
                <h2 className="text-3xl font-semibold text-gray-900 mb-12 text-center">
                  Frequently Asked Questions
                </h2>

                <div className="space-y-6">
                  {[
                    {
                      question: 'Can I upgrade or downgrade my plan anytime?',
                      answer: 'Yes, you can change your plan at any time. Your credits never expire and will carry over when you upgrade.',
                    },
                    {
                      question: 'Do credits expire?',
                      answer: 'No, credits never expire. Use them whenever you need, on your own schedule.',
                    },
                    {
                      question: 'What happens when I run out of credits?',
                      answer: 'You can upgrade to a higher plan or purchase additional credits. You can also keep using the free plan with its monthly credit allowance.',
                    },
                    {
                      question: 'Is there a money-back guarantee?',
                      answer: 'We stand behind our service. Contact us if you\'re not satisfied, and we\'ll work with you on a solution.',
                    },
                  ].map((faq, idx) => (
                    <div key={idx} className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}

export default PlansPage