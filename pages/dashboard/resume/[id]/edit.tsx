import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const ResumeEditor = () => {
  const router = useRouter()
  const { id } = router.query
  const [resume, setResume] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('personal_info')
  const [formData, setFormData] = useState<any>({})

  const colors = {
    primary: '#000000',
    secondary: '#666666',
    accent: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    border: '#e5e7eb',
    light: '#f9fafb',
    lightGray: '#fafafa'
  }

  const sectionTypes = [
    { id: 'personal_info', label: 'Personal Info', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'achievements', label: 'Achievements', icon: '⭐' },
    { id: 'languages', label: 'Languages', icon: '🌍' }
  ]

  useEffect(() => {
    if (id) {
      fetchResume()
    }
  }, [id])

  const fetchResume = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/resumes/${id}`, {
        headers: { 'x-user-id': 'user-id-here' }
      })
      const data = await response.json()
      if (data.success) {
        setResume(data.data)
        setSections(data.data.sections || [])
        initializeFormData(data.data.sections || [])
      }
    } catch (err) {
      setError('Failed to load resume')
    } finally {
      setLoading(false)
    }
  }

  const initializeFormData = (sectionsData: any[]) => {
    const data: any = {}
    sectionsData.forEach((section: any) => {
      data[section.section_type] = section.section_data || {}
    })
    setFormData(data)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }))
  }

  const handleArrayFieldChange = (index: number, field: string, value: any) => {
    const currentArray = formData[activeTab]?.[field] || []
    const updatedArray = [...currentArray]
    updatedArray[index] = value
    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: updatedArray
      }
    }))
  }

  const handleAddArrayItem = (field: string) => {
    const currentArray = formData[activeTab]?.[field] || []
    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: [...currentArray, '']
      }
    }))
  }

  const handleRemoveArrayItem = (field: string, index: number) => {
    const currentArray = formData[activeTab]?.[field] || []
    const updatedArray = currentArray.filter((_: any, i: number) => i !== index)
    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: updatedArray
      }
    }))
  }

  const saveSection = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/resumes/${id}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-id-here'
        },
        body: JSON.stringify({
          section_type: activeTab,
          content: formData[activeTab] || {}
        })
      })

      const data = await response.json()
      if (data.success) {
        setError('')
        // Re-fetch to update sections
        fetchResume()
      } else {
        setError(data.error || 'Failed to save section')
      }
    } catch (err) {
      setError('Failed to save section')
    } finally {
      setSaving(false)
    }
  }

  const renderSectionForm = () => {
    const currentData = formData[activeTab] || {}

    switch (activeTab) {
      case 'personal_info':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Full Name" value={currentData.name} onChange={(v: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('name', v)} />
            <FormField label="Email" type="email" value={currentData.email} onChange={(v: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('email', v)} />
            <FormField label="Phone" value={currentData.phone} onChange={(v: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('phone', v)} />
            <FormField label="Location" value={currentData.location} onChange={(v: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('location', v)} />
            <FormField label="Portfolio URL" value={currentData.portfolio} onChange={(v: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('portfolio', v)} />
            <FormField label="LinkedIn" value={currentData.linkedin} onChange={(v: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('linkedin', v)} />
          </div>
        )

      case 'summary':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField
              label="Professional Summary"
              textarea
              value={currentData.text}
              onChange={(v: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('text', v)}
              placeholder="Write a brief professional summary..."
            />
          </div>
        )

      case 'experience':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ArrayFieldEditor
              label="Work Experience"
              items={currentData.items || []}
              fields={[
                { name: 'company', label: 'Company', type: 'text' },
                { name: 'position', label: 'Position', type: 'text' },
                { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'e.g., Jan 2020' },
                { name: 'endDate', label: 'End Date', type: 'text', placeholder: 'e.g., Present' },
                { name: 'description', label: 'Description', type: 'textarea' }
              ]}
              onItemChange={(idx: number, field: string, val: any) => {
                const items = currentData.items || []
                const updated = [...items]
                updated[idx] = { ...updated[idx], [field]: val }
                handleInputChange('items', updated)
              }}
              onAddItem={() => handleAddArrayItem('items')}
              onRemoveItem={(idx: number) => {
                const items = currentData.items || []
                handleInputChange('items', items.filter((_: any, i: number) => i !== idx))
              }}
            />
          </div>
        )

      case 'education':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ArrayFieldEditor
              label="Education"
              items={currentData.items || []}
              fields={[
                { name: 'school', label: 'School/University', type: 'text' },
                { name: 'degree', label: 'Degree', type: 'text' },
                { name: 'field', label: 'Field of Study', type: 'text' },
                { name: 'graduationDate', label: 'Graduation Date', type: 'text', placeholder: 'e.g., May 2020' }
              ]}
              onItemChange={(idx: number, field: string, val: any) => {
                const items = currentData.items || []
                const updated = [...items]
                updated[idx] = { ...updated[idx], [field]: val }
                handleInputChange('items', updated)
              }}
              onAddItem={() => handleAddArrayItem('items')}
              onRemoveItem={(idx: number) => {
                const items = currentData.items || []
                handleInputChange('items', items.filter((_: any, i: number) => i !== idx))
              }}
            />
          </div>
        )

      case 'skills':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ListFieldEditor
              label="Skills (one per line)"
              items={currentData.items || []}
              onItemChange={(idx: number, val: any) => handleArrayFieldChange(idx, 'items', val)}
              onAddItem={() => handleAddArrayItem('items')}
              onRemoveItem={(idx: number) => handleRemoveArrayItem('items', idx)}
            />
          </div>
        )

      case 'languages':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ArrayFieldEditor
              label="Languages"
              items={currentData.items || []}
              fields={[
                { name: 'language', label: 'Language', type: 'text' },
                { name: 'proficiency', label: 'Proficiency', type: 'select', options: ['Native', 'Fluent', 'Intermediate', 'Basic'] }
              ]}
              onItemChange={(idx: number, field: string, val: any) => {
                const items = currentData.items || []
                const updated = [...items]
                updated[idx] = { ...updated[idx], [field]: val }
                handleInputChange('items', updated)
              }}
              onAddItem={() => handleAddArrayItem('items')}
              onRemoveItem={(idx: number) => {
                const items = currentData.items || []
                handleInputChange('items', items.filter((_: any, i: number) => i !== idx))
              }}
            />
          </div>
        )

      case 'certifications':
      case 'projects':
      case 'achievements':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ListFieldEditor
              label={`${sectionTypes.find(s => s.id === activeTab)?.label} (one per line)`}
              items={currentData.items || []}
              onItemChange={(idx: number, val: any) => handleArrayFieldChange(idx, 'items', val)}
              onAddItem={() => handleAddArrayItem('items')}
              onRemoveItem={(idx: number) => handleRemoveArrayItem('items', idx)}
            />
          </div>
        )

      default:
        return <p>Section not configured</p>
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Resume - Cloud9 Resume</title>
        </Head>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading resume...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{resume?.title} - Resume Editor - Cloud9 Resume</title>
      </Head>

      <div style={{ background: colors.light, minHeight: '100vh', display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: '280px', background: 'white', borderRight: `1px solid ${colors.border}`, overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.primary, margin: 0, marginBottom: '4px' }}>
              {resume?.title}
            </h2>
            <p style={{ fontSize: '12px', color: colors.secondary, margin: 0 }}>
              {resume?.job_title || 'No job title'}
            </p>
          </div>

          <div style={{ padding: '12px' }}>
            {sectionTypes.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  margin: '4px 0',
                  background: activeTab === section.id ? colors.accent : 'transparent',
                  color: activeTab === section.id ? 'white' : colors.primary,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ marginRight: '8px' }}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '20px', background: 'white', borderBottom: `1px solid ${colors.border}` }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: colors.primary, margin: 0 }}>
              {sectionTypes.find(s => s.id === activeTab)?.label}
            </h1>
          </div>

          {/* Form Area */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
            <div style={{ maxWidth: '800px' }}>
              {error && (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: colors.error, borderRadius: '6px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}
              {renderSectionForm()}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '20px', background: 'white', borderTop: `1px solid ${colors.border}`, display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => router.push(`/dashboard/resumes`)}
              style={{
                padding: '10px 20px',
                background: colors.light,
                color: colors.primary,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
            <button
              onClick={saveSection}
              disabled={saving}
              style={{
                padding: '10px 20px',
                background: colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Section'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Helper Components
const FormField = ({ label, value, onChange, type = 'text', textarea = false, placeholder = '' }: any) => {
  if (textarea) {
    return (
      <div>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>
          {label}
        </label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
            minHeight: '120px',
            boxSizing: 'border-box'
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
    </div>
  )
}

const ListFieldEditor = ({ label, items, onItemChange, onAddItem, onRemoveItem }: any) => (
  <div>
    <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '12px' }}>
      {label}
    </label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {(items || []).map((item: string, idx: number) => (
        <div key={idx} style={{ display: 'flex', gap: '8px' }}>
          <input
            value={item}
            onChange={(e) => onItemChange(idx, e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={() => onRemoveItem(idx)}
            style={{
              padding: '10px 12px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={onAddItem}
        style={{
          padding: '10px 12px',
          background: '#dbeafe',
          color: '#2563eb',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          marginTop: '8px'
        }}
      >
        + Add Item
      </button>
    </div>
  </div>
)

const ArrayFieldEditor = ({ label, items, fields, onItemChange, onAddItem, onRemoveItem }: any) => (
  <div>
    <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '12px' }}>
      {label}
    </label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {(items || []).map((item: any, idx: number) => (
        <div
          key={idx}
          style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#fafafa'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Item {idx + 1}</h4>
            <button
              onClick={() => onRemoveItem(idx)}
              style={{
                padding: '6px 12px',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Delete
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {fields.map((field: any) => (
              <div key={field.name}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '4px' }}>
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={item[field.name] || ''}
                    onChange={(e) => onItemChange(idx, field.name, e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      minHeight: '80px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={item[field.name] || ''}
                    onChange={(e) => onItemChange(idx, field.name, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={item[field.name] || ''}
                    onChange={(e) => onItemChange(idx, field.name, e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={onAddItem}
        style={{
          padding: '10px 12px',
          background: '#dbeafe',
          color: '#2563eb',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          marginTop: '8px'
        }}
      >
        + Add {label}
      </button>
    </div>
  </div>
)

export default ResumeEditor
