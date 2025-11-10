import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const AnalyticsDashboard = () => {
  const router = useRouter()
  const { id } = router.query
  const [resume, setResume] = useState<any>(null)
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [atsHistory, setAtsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('30d')

  const colors = {
    primary: '#000000',
    secondary: '#666666',
    accent: '#3b82f6',
    border: '#e5e7eb',
    light: '#f9fafb'
  }

  useEffect(() => {
    fetchData()
  }, [id, timeRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resumeRes, portfoliosRes] = await Promise.all([
        fetch(`/api/resumes/${id}`, { headers: { 'x-user-id': 'user-id-here' } }),
        fetch('/api/resumes/portfolio', { headers: { 'x-user-id': 'user-id-here' } })
      ])

      const resumeData = await resumeRes.json()
      const portfoliosData = await portfoliosRes.json()

      setResume(resumeData.data)
      setPortfolios(portfoliosData.data?.filter((p: any) => p.resume_id === id) || [])

      // Mock ATS history for demo
      setAtsHistory([
        { date: '2025-01-08', score: 78, keywords_matched: 45, keywords_total: 62 },
        { date: '2025-01-05', score: 72, keywords_matched: 40, keywords_total: 62 },
        { date: '2024-12-28', score: 85, keywords_matched: 53, keywords_total: 62 },
        { date: '2024-12-20', score: 68, keywords_matched: 35, keywords_total: 62 }
      ])
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const totalViews = portfolios.reduce((sum, p) => sum + (p.view_count || 0), 0)
  const totalDownloads = portfolios.reduce((sum, p) => sum + (p.download_count || 0), 0)
  const totalClicks = portfolios.reduce((sum, p) => sum + (p.click_count || 0), 0)
  const avgAtsScore = atsHistory.length > 0 ? Math.round(atsHistory.reduce((sum, a) => sum + a.score, 0) / atsHistory.length) : 0

  const StatCard = ({ label, value, icon, color }: any) => (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', border: `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '600', color: colors.secondary, margin: 0 }}>
          {label}
        </h3>
        <div style={{ fontSize: '20px' }}>{icon}</div>
      </div>
      <p style={{ fontSize: '28px', fontWeight: '700', color: color || colors.accent, margin: 0 }}>
        {value}
      </p>
    </div>
  )

  if (loading) {
    return (
      <>
        <Head>
          <title>Analytics - Cloud9 Resume</title>
        </Head>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading analytics...</div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Analytics - {resume?.title} - Cloud9 Resume</title>
      </Head>

      <div style={{ background: colors.light, minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: colors.primary, margin: '0 0 8px 0' }}>
                Analytics
              </h1>
              <p style={{ fontSize: '14px', color: colors.secondary, margin: 0 }}>
                Track portfolio performance and ATS scores for {resume?.title}
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: '6px', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {/* Portfolio Metrics */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              Portfolio Performance
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <StatCard label="Total Views" value={totalViews} icon="👁️" color="#3b82f6" />
              <StatCard label="Downloads" value={totalDownloads} icon="⬇️" color="#10b981" />
              <StatCard label="Link Clicks" value={totalClicks} icon="🔗" color="#f59e0b" />
              <StatCard label="Active Links" value={portfolios.filter((p) => p.is_published).length} icon="📱" color="#8b5cf6" />
            </div>
          </div>

          {/* ATS Performance */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              ATS Score Trends
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <StatCard label="Current ATS Score" value={`${atsHistory[0]?.score || 0}%`} icon="📊" color="#ef4444" />
              <StatCard label="Average Score (30d)" value={`${avgAtsScore}%`} icon="📈" color="#3b82f6" />
              <StatCard label="Keywords Matched" value={`${atsHistory[0]?.keywords_matched || 0}/${atsHistory[0]?.keywords_total || 0}`} icon="🔍" color="#10b981" />
              <StatCard label="Score Trend" value={atsHistory[0] && atsHistory[1] && atsHistory[0].score > atsHistory[1].score ? '↗️ Up' : '↘️ Down'} icon="📉" color={atsHistory[0] && atsHistory[1] && atsHistory[0].score > atsHistory[1].score ? '#10b981' : '#ef4444'} />
            </div>
          </div>

          {/* Portfolio Details */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', marginBottom: '32px', border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              Portfolio Links Breakdown
            </h2>

            {portfolios.length === 0 ? (
              <p style={{ fontSize: '14px', color: colors.secondary, margin: 0 }}>
                No portfolio links yet. Create one to start tracking analytics.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                      <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: '700', color: colors.primary }}>Slug</th>
                      <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '700', color: colors.primary }}>Views</th>
                      <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '700', color: colors.primary }}>Downloads</th>
                      <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '700', color: colors.primary }}>Clicks</th>
                      <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '700', color: colors.primary }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolios.map((portfolio) => (
                      <tr key={portfolio.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ padding: '12px 0', fontWeight: '600' }}>
                          {portfolio.slug} {portfolio.is_primary && <span style={{ fontSize: '11px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '3px', marginLeft: '8px' }}>PRIMARY</span>}
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'center', color: colors.accent, fontWeight: '600' }}>
                          {portfolio.view_count || 0}
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'center', color: colors.accent, fontWeight: '600' }}>
                          {portfolio.download_count || 0}
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'center', color: colors.accent, fontWeight: '600' }}>
                          {portfolio.click_count || 0}
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              background: portfolio.is_published ? '#dbeafe' : '#fecaca',
                              color: portfolio.is_published ? colors.accent : '#dc2626',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'capitalize'
                            }}
                          >
                            {portfolio.is_published ? 'Published' : 'Archived'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ATS Score History */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
              ATS Score History
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: '700', color: colors.primary }}>Date</th>
                    <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '700', color: colors.primary }}>ATS Score</th>
                    <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '700', color: colors.primary }}>Keywords Matched</th>
                    <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '700', color: colors.primary }}>Match Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {atsHistory.map((item, idx) => {
                    const matchRate = Math.round((item.keywords_matched / item.keywords_total) * 100)
                    return (
                      <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ padding: '12px 0' }}>
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              background: item.score >= 75 ? '#dbeafe' : item.score >= 50 ? '#fef3c7' : '#fecaca',
                              color: item.score >= 75 ? colors.accent : item.score >= 50 ? '#d97706' : '#dc2626',
                              borderRadius: '4px',
                              fontWeight: '700'
                            }}
                          >
                            {item.score}%
                          </span>
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'center', fontWeight: '600' }}>
                          {item.keywords_matched}/{item.keywords_total}
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'center', color: colors.accent, fontWeight: '600' }}>
                          {matchRate}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Back Button */}
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '10px 20px',
                background: colors.border,
                color: colors.primary,
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to Resume
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AnalyticsDashboard
