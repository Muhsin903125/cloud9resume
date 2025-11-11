import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Resume } from '../../lib/types'
import { EditIcon, DeleteIcon, EyeIcon, PlusIcon, SearchIcon } from '../../components/Icons'
import SharedButton from '../../components/SharedButton'
import SharedCard from '../../components/SharedCard'
import SharedModal from '../../components/SharedModal'
import FormField from '../../components/FormField'
import { colors } from '../../lib/constants'
import { useAPIAuth } from '../../hooks/useAPIAuth'

const ResumeDashboard = () => {
  const router = useRouter()
  const { get, post, delete: deleteRequest, loading: apiLoading, error: apiError } = useAPIAuth()
  
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newResumeTitle, setNewResumeTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    console.log('📄 ResumeDashboard: Component mounted')
    console.log('📄 localStorage tokens:', {
      token: localStorage.getItem('x_user_auth_token')?.substring(0, 30) + '...',
      userId: localStorage.getItem('x_user_id'),
      email: localStorage.getItem('x_user_email'),
      expiry: localStorage.getItem('x_token_expiry')
    })
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await get<Resume[]>('/api/resumes')
      
      if (response.success) {
        setResumes(response.data || [])
      } else {
        setError(response.error || 'Failed to fetch resumes')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to fetch resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) return

    try {
      setIsCreating(true)
      setError('')
      
      const response = await post<Resume>('/api/resumes', { 
        title: newResumeTitle 
      })

      if (response.success && response.data) {
        setShowNewModal(false)
        setNewResumeTitle('')
        // Redirect to edit page for new resume
        router.push(`/dashboard/resume/${response.data.id}/edit`)
      } else {
        setError(response.error || 'Failed to create resume')
      }
    } catch (err) {
      console.error('Create error:', err)
      setError('Failed to create resume. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const response = await deleteRequest(`/api/resumes/${id}`)

      if (response.success) {
        setResumes(resumes.filter(r => r.id !== id))
      } else {
        setError(response.error || 'Failed to delete resume')
      }
    } catch (err) {
      console.error('Delete error:', err)
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
        <title>My Resumes - Cloud9 Resume</title>
        <meta name="description" content="Manage your resumes" />
      </Head>

      <div style={{ background: colors.background.light, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${colors.border}`, background: 'white', padding: '24px 16px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.primary.black, margin: 0 }}>
                  My Resumes
                </h1>
                <p style={{ fontSize: '14px', color: colors.secondary.mediumGray, margin: '8px 0 0 0' }}>
                  {resumes.length} resume{resumes.length !== 1 ? 's' : ''} total
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(true)}
                style={{
                  padding: '10px 20px',
                  background: colors.primary.blue,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <PlusIcon size={18} color="white" />
                New Resume
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          {/* Search */}
          {resumes.length > 0 && (
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SearchIcon size={18} color={colors.secondary.mediumGray} />
              <input
                type="text"
                placeholder="Search by title or job position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  maxWidth: '400px',
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Error Message */}
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

          {/* Loading */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: colors.secondary.mediumGray }}>Loading resumes...</p>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              background: 'white', 
              borderRadius: '8px', 
              border: `1px solid ${colors.border}` 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: colors.primary.black, marginBottom: '8px' }}>
                {searchQuery ? 'No resumes found' : 'No resumes yet'}
              </p>
              <p style={{ fontSize: '14px', color: colors.secondary.mediumGray, marginBottom: '20px' }}>
                {searchQuery ? 'Try a different search' : 'Create your first resume to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowNewModal(true)}
                  style={{
                    padding: '10px 20px',
                    background: colors.primary.blue,
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
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
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
                    gap: '12px',
                    transition: 'box-shadow 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.primary.black, margin: '0 0 4px 0', wordBreak: 'break-word' }}>
                        {resume.title}
                      </h3>
                      {resume.job_title && (
                        <p style={{ fontSize: '12px', color: colors.secondary.mediumGray, margin: 0 }}>
                          {resume.job_title}
                        </p>
                      )}
                    </div>
                    {resume.is_primary && (
                      <span style={{ 
                        fontSize: '11px', 
                        background: colors.primary.blue, 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px'
                      }}>
                        Primary
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: colors.secondary.mediumGray, margin: 0 }}>
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => router.push(`/dashboard/resume/${resume.id}/edit`)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: colors.primary.blue,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <EditIcon size={14} color="white" />
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/resume/${resume.id}/preview`)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: colors.background.light,
                        color: colors.primary.black,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <EyeIcon size={14} color={colors.primary.black} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      style={{
                        padding: '8px 12px',
                        background: 'white',
                        color: colors.accent.red,
                        border: `1px solid ${colors.accent.red}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <DeleteIcon size={14} color={colors.accent.red} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Resume Modal */}
        <SharedModal 
          isOpen={showNewModal} 
          onClose={() => {
            setShowNewModal(false)
            setNewResumeTitle('')
          }}
          title="Create New Resume"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField
              label="Resume Title"
              name="title"
              type="text"
              value={newResumeTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const target = e.target as HTMLInputElement
                setNewResumeTitle(target.value)
              }}
              placeholder="e.g., Software Engineer Resume"
              required
              helpText="You can rename this later"
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setShowNewModal(false)
                  setNewResumeTitle('')
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: colors.background.light,
                  color: colors.primary.black,
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
                disabled={!newResumeTitle.trim() || isCreating}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: newResumeTitle.trim() && !isCreating ? colors.primary.blue : colors.border,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: newResumeTitle.trim() && !isCreating ? 'pointer' : 'not-allowed',
                  opacity: isCreating ? 0.7 : 1
                }}
              >
                {isCreating ? 'Creating...' : 'Create Resume'}
              </button>
            </div>
          </div>
        </SharedModal>
      </div>
    </>
  )
}

export default ResumeDashboard