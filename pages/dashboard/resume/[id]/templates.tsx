import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const TemplateSelector = () => {
  const router = useRouter()
  const { id } = router.query
  const [resume, setResume] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [error, setError] = useState('')

  const colors = {
    primary: '#000000',
    secondary: '#666666',
    accent: '#3b82f6',
    border: '#e5e7eb',
    light: '#f9fafb'
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resumeRes, templatesRes] = await Promise.all([
        fetch(`/api/resumes/${id}`, { headers: { 'x-user-id': 'user-id-here' } }),
        fetch('/api/resumes/templates', { headers: { 'x-user-id': 'user-id-here' } })
      ])

      const resumeData = await resumeRes.json()
      const templatesData = await templatesRes.json()

      setResume(resumeData.data)
      setTemplates(templatesData.data || [])
      setSelectedTemplate(resumeData.data?.template_id || null)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = async () => {
    if (!selectedTemplate) return

    try {
      setApplying(true)
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-id-here'
        },
        body: JSON.stringify({ template_id: selectedTemplate })
      })

      const data = await response.json()
      if (data.success) {
        setError('')
        router.push(`/dashboard/resumes`)
      } else {
        setError(data.error || 'Failed to apply template')
      }
    } catch (err) {
      setError('Failed to apply template')
    } finally {
      setApplying(false)
    }
  }

  const filteredTemplates = templates.filter((t) =>
    categoryFilter === 'all' || t.category === categoryFilter
  )

  const categories = ['all', ...new Set(templates.map((t) => t.category))]

  if (loading) {
    return (
      <>
        <Head>
          <title>Select Template - Cloud9 Resume</title>
        </Head>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading templates...</div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Select Template - {resume?.title} - Cloud9 Resume</title>
      </Head>

      <div style={{ background: colors.light, minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: colors.primary, margin: '0 0 8px 0' }}>
              Choose Template
            </h1>
            <p style={{ fontSize: '14px', color: colors.secondary, margin: 0 }}>
              Select a professional template for {resume?.title}
            </p>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '8px 16px',
                  background: categoryFilter === cat ? colors.accent : 'white',
                  color: categoryFilter === cat ? 'white' : colors.primary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: '6px', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {/* Templates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                style={{
                  background: 'white',
                  border: selectedTemplate === template.id ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedTemplate === template.id ? `0 0 0 3px rgba(59, 130, 246, 0.1)` : 'none'
                }}
              >
                {/* Template Preview */}
                <div
                  style={{
                    height: '180px',
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: colors.secondary,
                    fontStyle: 'italic'
                  }}
                >
                  Preview
                </div>

                {/* Template Info */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: '0 0 4px 0' }}>
                    {template.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: colors.secondary, margin: '0 0 12px 0' }}>
                    {template.description}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        background: '#dbeafe',
                        color: colors.accent,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}
                    >
                      {template.category}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}
                    >
                      {template.requires_plan}
                    </span>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedTemplate === template.id && (
                  <div
                    style={{
                      padding: '12px',
                      background: '#dbeafe',
                      color: colors.accent,
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  >
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '10px 20px',
                background: 'white',
                color: colors.primary,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={applyTemplate}
              disabled={!selectedTemplate || applying}
              style={{
                padding: '10px 20px',
                background: selectedTemplate && !applying ? colors.accent : colors.border,
                color: selectedTemplate && !applying ? 'white' : colors.secondary,
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: selectedTemplate && !applying ? 'pointer' : 'not-allowed'
              }}
            >
              {applying ? 'Applying...' : 'Apply Template'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default TemplateSelector
