import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const EnhancedResumeEditor = () => {
  const router = useRouter()
  const { id } = router.query
  const [resume, setResume] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('personal_info')
  const [formData, setFormData] = useState<any>({})

  const colors = {
    primary: '#000000',
    secondary: '#666666',
    accent: '#3b82f6',
    border: '#e5e7eb',
    light: '#f9fafb'
  }

  const navItems = [
    { id: 'edit', label: '✏️ Edit', action: () => setActiveTab('personal_info') },
    { id: 'templates', label: '🎨 Templates', action: () => router.push(`/dashboard/resume/${id}/templates`) },
    { id: 'export', label: '⬇️ Export', action: () => router.push(`/dashboard/resume/${id}/export`) },
    { id: 'portfolio', label: '📱 Portfolio', action: () => router.push(`/dashboard/resume/${id}/portfolio`) },
    { id: 'analytics', label: '📊 Analytics', action: () => router.push(`/dashboard/resume/${id}/analytics`) },
    { id: 'ai-tools', label: '✨ AI Tools', action: () => router.push(`/dashboard/resume/${id}/ai-tools`) }
  ]

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/resumes/${id}`, {
        headers: { 'x-user-id': 'user-id-here' }
      })
      const data = await response.json()

      if (data.data) {
        setResume(data.data)
        setSections(data.data.resume_sections || [])

        // Initialize formData from sections
        const initialFormData: any = {}
        data.data.resume_sections?.forEach((section: any) => {
          initialFormData[section.section_type] = section.section_data || {}
        })
        setFormData(initialFormData)
      }
    } catch (err) {
      setError('Failed to load resume')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Edit Resume - Cloud9 Resume</title>
        </Head>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Edit {resume?.title} - Cloud9 Resume</title>
      </Head>

      <div style={{ background: colors.light, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'white', borderBottom: `1px solid ${colors.border}`, padding: '16px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/dashboard/resumes')}
              style={{ fontSize: '14px', fontWeight: '600', color: colors.secondary, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Back to Dashboard
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: colors.primary }}>
              {resume?.title}
            </h1>
            <div style={{ width: '100px' }} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ background: 'white', borderBottom: `2px solid ${colors.border}`, overflowX: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4px', padding: '0 24px' }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                style={{
                  padding: '12px 16px',
                  background: activeTab === item.id ? colors.accent : 'transparent',
                  color: activeTab === item.id ? 'white' : colors.primary,
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  borderBottom: activeTab === item.id ? 'none' : `2px solid transparent`
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              Resume Editor
            </h2>

            {error && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: '6px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <QuickActionButton icon="📋" label="View Resume" onClick={() => window.open(`/portfolio/${resume?.id}`, '_blank')} />
              <QuickActionButton icon="🔄" label="Duplicate Resume" onClick={() => alert('Duplicate functionality coming soon')} />
              <QuickActionButton icon="📤" label="Download Export" onClick={() => router.push(`/dashboard/resume/${id}/export`)} />
              <QuickActionButton icon="✨" label="AI Enhancement" onClick={() => router.push(`/dashboard/resume/${id}/ai-tools`)} />
            </div>

            {/* Navigation Suggestions */}
            <div style={{ padding: '16px', background: colors.light, borderRadius: '6px', marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', color: colors.secondary, margin: 0 }}>
                💡 <strong>Tip:</strong> Use the tabs above to access templates, export formats, portfolio links, analytics, and AI enhancement tools!
              </p>
            </div>

            {/* Content */}
            <div style={{ padding: '16px', background: colors.light, borderRadius: '6px', minHeight: '200px' }}>
              <p style={{ fontSize: '14px', color: colors.secondary, margin: 0 }}>
                📝 Click on the tabs above to navigate between different sections of your resume builder. Each section provides specialized tools for editing, exporting, publishing, and analyzing your resume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const QuickActionButton = ({ icon, label, onClick }: any) => {
  const colors = {
    accent: '#3b82f6',
    border: '#e5e7eb',
    secondary: '#666666'
  }

  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px',
        background: 'white',
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: colors.secondary,
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.accent
        e.currentTarget.style.color = 'white'
        e.currentTarget.style.borderColor = colors.accent
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'white'
        e.currentTarget.style.color = colors.secondary
        e.currentTarget.style.borderColor = colors.border
      }}
    >
      {icon} {label}
    </button>
  )
}

export default EnhancedResumeEditor
