import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const ResumeDashboard = () => {
  const router = useRouter()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newResumeTitle, setNewResumeTitle] = useState('')

  const colors = {
    primary: '#000000',
    secondary: '#666666',
    accent: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    border: '#e5e7eb',
    light: '#f9fafb'
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/resumes', {
        headers: { 'x-user-id': 'user-id-here' }
      })
      const data = await response.json()
      if (data.success) {
        setResumes(data.data || [])
      }
    } catch (err) {
      setError('Failed to fetch resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) return

    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-id-here'
        },
        body: JSON.stringify({ title: newResumeTitle })
      })

      const data = await response.json()
      if (data.success) {
        setShowNewModal(false)
        setNewResumeTitle('')
        router.push(`/dashboard/resume/${data.data.id}/edit`)
      }
    } catch (err) {
      setError('Failed to create resume')
    }
  }

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'user-id-here' }
      })

      if (response.ok) {
        setResumes(resumes.filter(r => r.id !== id))
      }
    } catch (err) {
      setError('Failed to delete resume')
    }
  }

  const filteredResumes = resumes.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.job_title && r.job_title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <>
      <Head>
        <title>Resume Dashboard - Cloud9 Resume</title>
      </Head>

      <div style={{ background: colors.light, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${colors.border}`, background: 'white', padding: '24px 16px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.primary, margin: 0 }}>
                My Resumes
              </h1>
              <button
                onClick={() => setShowNewModal(true)}
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
                + New Resume
              </button>
            </div>
            <p style={{ fontSize: '14px', color: colors.secondary, margin: 0 }}>
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} created
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search by title or job position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '24px',
              boxSizing: 'border-box'
            }}
          />

          {/* Error Message */}
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: colors.error, borderRadius: '6px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading resumes...</p>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
              <p style={{ fontSize: '16px', fontWeight: '600', color: colors.primary, marginBottom: '8px' }}>No resumes yet</p>
              <p style={{ fontSize: '14px', color: colors.secondary, marginBottom: '20px' }}>
                Create your first resume to get started
              </p>
              <button
                onClick={() => setShowNewModal(true)}
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
                Create Resume
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredResumes.map(resume => (
                <div
                  key={resume.id}
                  style={{
                    background: 'white',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.primary, margin: '0 0 4px 0' }}>
                        {resume.title}
                      </h3>
                      {resume.job_title && (
                        <p style={{ fontSize: '12px', color: colors.secondary, margin: 0 }}>
                          {resume.job_title}
                        </p>
                      )}
                    </div>
                    {resume.is_primary && (
                      <span style={{ fontSize: '12px', background: colors.accent, color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                        Primary
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: colors.secondary, margin: 0 }}>
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => router.push(`/dashboard/resume/${resume.id}/edit`)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: colors.accent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/resume/${resume.id}/preview`)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: colors.light,
                        color: colors.primary,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      style={{
                        padding: '8px 12px',
                        background: 'white',
                        color: colors.error,
                        border: `1px solid ${colors.error}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Resume Modal */}
        {showNewModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowNewModal(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '400px',
                width: '90%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.primary, margin: '0 0 16px 0' }}>
                Create New Resume
              </h2>
              <input
                type="text"
                placeholder="Resume title (e.g., Software Engineer)"
                value={newResumeTitle}
                onChange={(e) => setNewResumeTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowNewModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: colors.light,
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
                  onClick={handleCreateResume}
                  disabled={!newResumeTitle.trim()}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: newResumeTitle.trim() ? colors.accent : colors.border,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newResumeTitle.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ResumeDashboard
