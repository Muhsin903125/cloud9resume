import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { EditIcon, DownloadIcon, CopyIcon, AIIcon, EyeIcon, ChevronLeftIcon } from '../../../../components/Icons'
import { colors } from '../../../../lib/constants'

const EnhancedResumeEditor = () => {
  const router = useRouter()
  const { id } = router.query
  const [resume, setResume] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('edit')
  const [formData, setFormData] = useState<any>({})

  const navItems = [
    { id: 'edit', label: 'Edit', icon: EditIcon, action: () => setActiveTab('edit') },
    { id: 'templates', label: 'Templates', icon: DownloadIcon, action: () => router.push(`/dashboard/resume/${id}/templates`) },
    { id: 'export', label: 'Export', icon: DownloadIcon, action: () => router.push(`/dashboard/resume/${id}/export`) },
    { id: 'portfolio', label: 'Portfolio', icon: EyeIcon, action: () => router.push(`/dashboard/resume/${id}/portfolio`) },
    { id: 'analytics', label: 'Analytics', icon: EditIcon, action: () => router.push(`/dashboard/resume/${id}/analytics`) },
    { id: 'ai-tools', label: 'AI Tools', icon: AIIcon, action: () => router.push(`/dashboard/resume/${id}/ai-tools`) }
  ]

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/resumes/${id}`)
      const data = await response.json()

      if (data.success && data.data) {
        setResume(data.data)
        setSections(data.data.resume_sections || [])

        // Initialize formData from sections
        const initialFormData: any = {}
        data.data.resume_sections?.forEach((section: any) => {
          initialFormData[section.section_type] = section.section_data || {}
        })
        setFormData(initialFormData)
      } else {
        setError(data.error || 'Failed to load resume')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load resume')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Resume - Cloud9 Resume</title>
        </Head>
        <div style={{ padding: '40px', textAlign: 'center', color: colors.secondary.mediumGray }}>
          Loading resume...
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{resume?.title ? `Edit ${resume.title}` : 'Resume'} - Cloud9 Resume</title>
      </Head>

      <div style={{ background: colors.background.light, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'white', borderBottom: `1px solid ${colors.border}`, padding: '16px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/dashboard/resume')}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px', 
                fontWeight: '600', 
                color: colors.primary.black, 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer'
              }}
            >
              <ChevronLeftIcon size={18} color={colors.primary.black} />
              Back
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: colors.primary.black }}>
              {resume?.title || 'Resume'}
            </h1>
            <div style={{ width: '100px' }} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ background: 'white', borderBottom: `2px solid ${colors.border}`, overflowX: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4px', padding: '0 24px' }}>
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  style={{
                    padding: '12px 16px',
                    background: activeTab === item.id ? colors.primary.blue : 'transparent',
                    color: activeTab === item.id ? 'white' : colors.primary.black,
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== item.id) {
                      e.currentTarget.style.backgroundColor = colors.secondary.lightGray
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== item.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <IconComponent size={16} color={activeTab === item.id ? 'white' : colors.primary.black} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.primary.black, margin: '0 0 16px 0' }}>
              Resume Editor
            </h2>

            {error && (
              <div style={{ 
                padding: '12px 16px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: colors.accent.red, 
                borderRadius: '6px', 
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.accent.red,
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <QuickActionButton icon={EyeIcon} label="View Resume" onClick={() => window.open(`/portfolio/${resume?.id}`, '_blank')} />
              <QuickActionButton icon={CopyIcon} label="Duplicate Resume" onClick={() => alert('Duplicate functionality coming soon')} />
              <QuickActionButton icon={DownloadIcon} label="Download Export" onClick={() => router.push(`/dashboard/resume/${id}/export`)} />
              <QuickActionButton icon={AIIcon} label="AI Enhancement" onClick={() => router.push(`/dashboard/resume/${id}/ai-tools`)} />
            </div>

            {/* Navigation Suggestions */}
            <div style={{ padding: '16px', background: colors.background.light, borderRadius: '6px', marginBottom: '24px', border: `1px solid ${colors.border}` }}>
              <p style={{ fontSize: '13px', color: colors.secondary.mediumGray, margin: 0, lineHeight: '1.5' }}>
                <strong>Tip:</strong> Use the tabs above to access templates, export formats, portfolio links, analytics, and AI enhancement tools!
              </p>
            </div>

            {/* Content */}
            <div style={{ padding: '16px', background: colors.background.light, borderRadius: '6px', minHeight: '200px', border: `1px solid ${colors.border}` }}>
              <p style={{ fontSize: '14px', color: colors.secondary.mediumGray, margin: 0, lineHeight: '1.6' }}>
                Click on the tabs above to navigate between different sections of your resume builder. Each section provides specialized tools for editing, exporting, publishing, and analyzing your resume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const QuickActionButton = ({ icon: IconComponent, label, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px',
        background: isHovered ? colors.primary.blue : 'white',
        border: `1px solid ${isHovered ? colors.primary.blue : colors.border}`,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: isHovered ? 'white' : colors.secondary.mediumGray,
        transition: 'all 0.2s'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <IconComponent size={16} color={isHovered ? 'white' : colors.secondary.mediumGray} />
      {label}
    </button>
  )
}

export default EnhancedResumeEditor
