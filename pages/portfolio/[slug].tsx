import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const PublicPortfolio = () => {
  const router = useRouter()
  const { slug } = router.query
  const [portfolio, setPortfolio] = useState<any>(null)
  const [resume, setResume] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const colors = {
    primary: '#000000',
    secondary: '#666666',
    accent: '#3b82f6',
    border: '#e5e7eb',
    light: '#f9fafb'
  }

  useEffect(() => {
    if (slug) {
      fetchPortfolio()
    }
  }, [slug])

  const fetchPortfolio = async (pwd?: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/portfolio/${slug}`, {
        method: 'GET',
        headers: pwd ? { 'Content-Type': 'application/json' } : undefined,
        body: pwd ? JSON.stringify({ password: pwd }) : undefined
      })

      const data = await response.json()

      if (response.status === 401) {
        setPasswordRequired(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        setError(data.error || 'Failed to load portfolio')
        setLoading(false)
        return
      }

      setPortfolio(data.data)
      setResume(data.data.resume)
      setPasswordRequired(false)
      setError('')
    } catch (err) {
      setError('Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPortfolio(password)
  }

  const downloadResume = async () => {
    try {
      // Track download
      await fetch(`/api/portfolio/${slug}`, {
        method: 'POST'
      })

      // Trigger download
      const link = document.createElement('a')
      link.href = `/api/portfolio/download/${slug}`
      link.download = `${resume?.title}.pdf`
      link.click()
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const SectionDisplay = ({ section }: any) => {
    const { section_type, section_data } = section

    const renderContent = () => {
      if (!section_data) return null

      switch (section_type) {
        case 'personal_info':
          return (
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>
                {section_data.name}
              </h3>
              <p style={{ fontSize: '14px', color: colors.secondary, margin: '0 0 12px 0' }}>
                {section_data.job_title}
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                {section_data.email && <span>{section_data.email}</span>}
                {section_data.phone && <span>{section_data.phone}</span>}
                {section_data.location && <span>{section_data.location}</span>}
              </div>
            </div>
          )

        case 'summary':
          return (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>Professional Summary</h2>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: colors.secondary, margin: 0 }}>
                {section_data}
              </p>
            </div>
          )

        case 'experience':
          return (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0' }}>Experience</h2>
              {(section_data || []).map((exp: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{exp.position}</h3>
                    <span style={{ fontSize: '12px', color: colors.secondary }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: colors.secondary, margin: '4px 0 8px 0' }}>
                    {exp.company}
                  </p>
                  <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          )

        case 'education':
          return (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0' }}>Education</h2>
              {(section_data || []).map((edu: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${colors.border}` }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
                    {edu.degree} in {edu.field}
                  </h3>
                  <p style={{ fontSize: '13px', color: colors.secondary, margin: '4px 0 0 0' }}>
                    {edu.school} • {edu.graduationDate}
                  </p>
                </div>
              ))}
            </div>
          )

        case 'skills':
          return (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0' }}>Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(section_data || []).map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      background: colors.light,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )

        case 'certifications':
        case 'projects':
        case 'achievements':
        case 'languages':
          return (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0', textTransform: 'capitalize' }}>
                {section_type.replace('_', ' ')}
              </h2>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {(section_data || []).map((item: any, idx: number) => (
                  <li key={idx} style={{ fontSize: '13px', marginBottom: '8px', color: colors.secondary }}>
                    {typeof item === 'string' ? item : item.language ? `${item.language} - ${item.proficiency}` : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </div>
          )

        default:
          return null
      }
    }

    return (
      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `2px solid ${colors.border}` }}>
        {renderContent()}
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Portfolio...</title>
        </Head>
        <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '12px' }}>
              Loading Portfolio...
            </div>
          </div>
        </div>
      </>
    )
  }

  if (passwordRequired) {
    return (
      <>
        <Head>
          <title>Portfolio - Password Required</title>
        </Head>
        <div style={{ padding: '40px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.light }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '32px', border: `1px solid ${colors.border}` }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>Protected Portfolio</h1>
              <p style={{ fontSize: '14px', color: colors.secondary, margin: '0 0 24px 0' }}>
                This portfolio is password protected. Please enter the password to continue.
              </p>

              <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: '12px' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    padding: '10px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />

                {error && (
                  <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</p>
                )}

                <button
                  type="submit"
                  style={{
                    padding: '10px',
                    background: colors.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Unlock Portfolio
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!portfolio || !resume) {
    return (
      <>
        <Head>
          <title>Portfolio Not Found</title>
        </Head>
        <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh' }}>
          <h1>Portfolio not found</h1>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{resume.title} - Portfolio</title>
        <meta name="description" content={`Professional resume of ${resume.title}`} />
      </Head>

      <div style={{ background: colors.light, minHeight: '100vh', padding: '40px 20px' }}>
        {/* Header with Download Button */}
        <div style={{ maxWidth: '900px', margin: '0 auto 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.primary, margin: 0 }}>
              Portfolio
            </h1>
          </div>
          <button
            onClick={downloadResume}
            style={{
              padding: '10px 20px',
              background: colors.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ⬇️ Download Resume
          </button>
        </div>

        {/* Resume Content */}
        <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '8px', padding: '40px', border: `1px solid ${colors.border}` }}>
          {/* Personal Info */}
          {resume.resume_sections
            .filter((s: any) => s.section_type === 'personal_info')
            .map((s: any, idx: number) => (
              <div key={idx} style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `2px solid ${colors.border}` }}>
                <SectionDisplay section={s} />
              </div>
            ))}

          {/* All Other Sections */}
          {resume.resume_sections
            .filter((s: any) => s.section_type !== 'personal_info')
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((section: any, idx: number) => (
              <SectionDisplay key={idx} section={section} />
            ))}
        </div>

        {/* Footer */}
        <div style={{ maxWidth: '900px', margin: '32px auto 0', textAlign: 'center', fontSize: '12px', color: colors.secondary }}>
          <p>© Cloud9 Resume - Professional Resume Builder</p>
        </div>
      </div>
    </>
  )
}

export default PublicPortfolio
