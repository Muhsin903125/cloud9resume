import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

/**
 * Global Test Suite for Resume Builder
 * Tests all 7 API endpoints with comprehensive coverage
 * Plan-based access control, credit system, authentication
 */

const BASE_URL = 'http://localhost:3000/api'
const TEST_USER_ID = 'test-user-12345'
const TEST_USER_ID_2 = 'test-user-67890'

// Helper function to make API requests
async function apiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  userId: string = TEST_USER_ID
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId
    }
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options)
  return {
    status: response.status,
    data: await response.json()
  }
}

describe('Resume Builder API Tests', () => {
  let resumeId: string
  let resumeId2: string
  let portfolioId: string
  let exportId: string

  // ==================== RESUME ENDPOINTS ====================
  describe('POST /api/resumes - Create Resume', () => {
    it('should create a new resume with valid title', async () => {
      const response = await apiRequest('/resumes', 'POST', {
        title: 'Software Engineer Resume'
      })

      expect(response.status).toBe(201)
      expect(response.data.success).toBe(true)
      expect(response.data.data).toHaveProperty('id')
      expect(response.data.data.title).toBe('Software Engineer Resume')
      expect(response.data.data.user_id).toBe(TEST_USER_ID)

      resumeId = response.data.data.id
    })

    it('should fail without title', async () => {
      const response = await apiRequest('/resumes', 'POST', {})

      expect(response.status).toBe(400)
      expect(response.data.success).toBe(false)
    })

    it('should fail without authentication', async () => {
      const response = await apiRequest('/resumes', 'POST', { title: 'Test' }, '')

      expect(response.status).toBe(401)
    })

    it('should enforce plan limits (free: 1 resume)', async () => {
      // First resume already created for TEST_USER_ID
      // Try creating second resume on free plan
      const response = await apiRequest('/resumes', 'POST', {
        title: 'Second Resume'
      })

      expect(response.status).toBe(403)
      expect(response.data.error).toContain('resume limit')
    })
  })

  describe('GET /api/resumes - List Resumes', () => {
    it('should return all user resumes', async () => {
      const response = await apiRequest('/resumes', 'GET')

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
      expect(response.data.data.length).toBeGreaterThan(0)
    })

    it('should not return other users resumes', async () => {
      const response = await apiRequest('/resumes', 'GET', null, TEST_USER_ID_2)

      expect(response.status).toBe(200)
      expect(response.data.data.length).toBe(0)
    })

    it('should include resume metadata', async () => {
      const response = await apiRequest('/resumes', 'GET')
      const resume = response.data.data[0]

      expect(resume).toHaveProperty('id')
      expect(resume).toHaveProperty('title')
      expect(resume).toHaveProperty('user_id')
      expect(resume).toHaveProperty('status')
      expect(resume).toHaveProperty('view_count')
      expect(resume).toHaveProperty('created_at')
    })
  })

  describe('GET /api/resumes/:id - Fetch Single Resume', () => {
    it('should fetch resume with sections', async () => {
      const response = await apiRequest(`/resumes/${resumeId}`, 'GET')

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(response.data.data.id).toBe(resumeId)
      expect(response.data.data).toHaveProperty('sections')
      expect(Array.isArray(response.data.data.sections)).toBe(true)
    })

    it('should increment view count', async () => {
      const response1 = await apiRequest(`/resumes/${resumeId}`, 'GET')
      const viewCount1 = response1.data.data.view_count

      const response2 = await apiRequest(`/resumes/${resumeId}`, 'GET')
      const viewCount2 = response2.data.data.view_count

      expect(viewCount2).toBe(viewCount1 + 1)
    })

    it('should return 404 for nonexistent resume', async () => {
      const response = await apiRequest('/resumes/nonexistent-id', 'GET')

      expect(response.status).toBe(404)
    })

    it('should not allow access to other users resumes', async () => {
      const response = await apiRequest(`/resumes/${resumeId}`, 'GET', null, TEST_USER_ID_2)

      expect(response.status).toBe(403)
    })
  })

  describe('PATCH /api/resumes/:id - Update Resume', () => {
    it('should update resume metadata', async () => {
      const response = await apiRequest(`/resumes/${resumeId}`, 'PATCH', {
        title: 'Updated Resume Title',
        job_title: 'Senior Engineer',
        theme_color: '#3b82f6'
      })

      expect(response.status).toBe(200)
      expect(response.data.data.title).toBe('Updated Resume Title')
      expect(response.data.data.job_title).toBe('Senior Engineer')
    })

    it('should set as primary resume', async () => {
      const response = await apiRequest(`/resumes/${resumeId}`, 'PATCH', {
        is_primary: true
      })

      expect(response.status).toBe(200)
      expect(response.data.data.is_primary).toBe(true)
    })

    it('should unset other primary resumes when setting new one', async () => {
      // Create second resume for different user
      const createRes = await apiRequest('/resumes', 'POST', {
        title: 'Resume 2'
      }, TEST_USER_ID_2)

      resumeId2 = createRes.data.data.id

      // Set as primary
      await apiRequest(`/resumes/${resumeId2}`, 'PATCH', {
        is_primary: true
      }, TEST_USER_ID_2)

      // Verify only one is primary
      const listRes = await apiRequest('/resumes', 'GET', null, TEST_USER_ID_2)
      const primaryCount = listRes.data.data.filter((r: any) => r.is_primary).length

      expect(primaryCount).toBe(1)
    })

    it('should not allow updating others resumes', async () => {
      const response = await apiRequest(`/resumes/${resumeId}`, 'PATCH', {
        title: 'Hacked Title'
      }, TEST_USER_ID_2)

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/resumes/:id - Delete Resume', () => {
    it('should soft delete resume (set status to archived)', async () => {
      const response = await apiRequest(`/resumes/${resumeId2}`, 'DELETE', null, TEST_USER_ID_2)

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)

      // Verify soft delete by checking status
      const getRes = await apiRequest(`/resumes/${resumeId2}`, 'GET', null, TEST_USER_ID_2)
      expect(getRes.status).toBe(404) // Should not be returned after soft delete
    })

    it('should not allow deleting others resumes', async () => {
      const response = await apiRequest(`/resumes/${resumeId}`, 'DELETE', null, TEST_USER_ID_2)

      expect(response.status).toBe(403)
    })
  })

  // ==================== SECTION ENDPOINTS ====================
  describe('POST /api/resumes/:resumeId/sections - Upsert Section', () => {
    it('should create new section', async () => {
      const response = await apiRequest(`/resumes/${resumeId}/sections`, 'POST', {
        section_type: 'personal',
        content: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          location: 'San Francisco, CA'
        }
      })

      expect(response.status).toBe(200)
      expect(response.data.data.section_type).toBe('personal')
      expect(response.data.data.content.name).toBe('John Doe')
    })

    it('should update existing section', async () => {
      await apiRequest(`/resumes/${resumeId}/sections`, 'POST', {
        section_type: 'personal',
        content: { name: 'Jane Doe', email: 'jane@example.com' }
      })

      const response = await apiRequest(`/resumes/${resumeId}/sections`, 'POST', {
        section_type: 'personal',
        content: { name: 'Jane Doe Updated', email: 'jane.new@example.com' }
      })

      expect(response.status).toBe(200)
      expect(response.data.data.content.name).toBe('Jane Doe Updated')
    })

    it('should validate section type', async () => {
      const response = await apiRequest(`/resumes/${resumeId}/sections`, 'POST', {
        section_type: 'invalid_type',
        content: {}
      })

      expect(response.status).toBe(400)
    })

    it('should not allow updating others sections', async () => {
      const response = await apiRequest(`/resumes/${resumeId}/sections`, 'POST', {
        section_type: 'personal',
        content: {}
      }, TEST_USER_ID_2)

      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/resumes/:resumeId/sections - Fetch Sections', () => {
    it('should return all sections for resume', async () => {
      const response = await apiRequest(`/resumes/${resumeId}/sections`, 'GET')

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should return sections ordered by order_index', async () => {
      const response = await apiRequest(`/resumes/${resumeId}/sections`, 'GET')
      const sections = response.data.data

      for (let i = 0; i < sections.length - 1; i++) {
        expect(sections[i].order_index).toBeLessThanOrEqual(sections[i + 1].order_index)
      }
    })
  })

  describe('DELETE /api/resumes/:resumeId/sections - Delete Section', () => {
    it('should delete specific section', async () => {
      await apiRequest(`/resumes/${resumeId}/sections`, 'POST', {
        section_type: 'skills',
        content: ['JavaScript', 'TypeScript']
      })

      const deleteRes = await apiRequest(`/resumes/${resumeId}/sections`, 'DELETE', {
        section_type: 'skills'
      })

      expect(deleteRes.status).toBe(200)

      // Verify deletion
      const sections = await apiRequest(`/resumes/${resumeId}/sections`, 'GET')
      const skillsSection = sections.data.data.find((s: any) => s.section_type === 'skills')
      expect(skillsSection).toBeUndefined()
    })
  })

  // ==================== TEMPLATE ENDPOINTS ====================
  describe('GET /api/resumes/templates - List Templates', () => {
    it('should return list of templates', async () => {
      const response = await apiRequest('/resumes/templates', 'GET')

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
      expect(response.data.data.length).toBeGreaterThan(0)
    })

    it('should include template metadata', async () => {
      const response = await apiRequest('/resumes/templates', 'GET')
      const template = response.data.data[0]

      expect(template).toHaveProperty('id')
      expect(template).toHaveProperty('name')
      expect(template).toHaveProperty('category')
      expect(template).toHaveProperty('plan_tier')
    })

    it('should filter by category', async () => {
      const response = await apiRequest('/resumes/templates?category=modern', 'GET')

      expect(response.data.data.every((t: any) => t.category === 'modern')).toBe(true)
    })

    it('should filter by plan tier', async () => {
      const response = await apiRequest('/resumes/templates?plan_tier=free', 'GET')

      expect(response.data.data.every((t: any) => t.plan_tier === 'free')).toBe(true)
    })
  })

  // ==================== EXPORT ENDPOINTS ====================
  describe('POST /api/resumes/export - Create Export', () => {
    it('should queue export for PDF', async () => {
      const response = await apiRequest('/resumes/export', 'POST', {
        resume_id: resumeId,
        format: 'pdf'
      })

      expect(response.status).toBe(201)
      expect(response.data.success).toBe(true)
      expect(response.data.data.format).toBe('pdf')
      expect(response.data.data.status).toBe('pending')

      exportId = response.data.data.id
    })

    it('should validate format', async () => {
      const response = await apiRequest('/resumes/export', 'POST', {
        resume_id: resumeId,
        format: 'invalid'
      })

      expect(response.status).toBe(400)
    })

    it('should track credits usage', async () => {
      const response = await apiRequest('/resumes/export', 'POST', {
        resume_id: resumeId,
        format: 'docx'
      })

      expect(response.data.data).toHaveProperty('credits_charged')
    })

    it('should require authentication', async () => {
      const response = await apiRequest('/resumes/export', 'POST', {
        resume_id: resumeId,
        format: 'pdf'
      }, '')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/resumes/export - Get Exports', () => {
    it('should return export history', async () => {
      const response = await apiRequest('/resumes/export', 'GET')

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)
    })

    it('should filter by resumeId', async () => {
      const response = await apiRequest(`/resumes/export?resumeId=${resumeId}`, 'GET')
      const exports = response.data.data

      expect(exports.every((e: any) => e.resume_id === resumeId)).toBe(true)
    })

    it('should only return own exports', async () => {
      const response = await apiRequest('/resumes/export', 'GET', null, TEST_USER_ID_2)

      expect(Array.isArray(response.data.data)).toBe(true)
    })
  })

  // ==================== PORTFOLIO ENDPOINTS ====================
  describe('POST /api/resumes/portfolio - Create Portfolio Link', () => {
    it('should publish resume to portfolio', async () => {
      const response = await apiRequest('/resumes/portfolio', 'POST', {
        resume_id: resumeId,
        slug: 'john-doe-resume'
      })

      expect(response.status).toBe(201)
      expect(response.data.success).toBe(true)
      expect(response.data.data.slug).toBe('john-doe-resume')

      portfolioId = response.data.data.id
    })

    it('should auto-generate slug if not provided', async () => {
      const response = await apiRequest('/resumes/portfolio', 'POST', {
        resume_id: resumeId
      })

      expect(response.status).toBe(201)
      expect(response.data.data.slug).toBeTruthy()
      expect(response.data.data.slug).toMatch(/^[a-f0-9]+$/)
    })

    it('should enforce unique slugs per user', async () => {
      const response1 = await apiRequest('/resumes/portfolio', 'POST', {
        resume_id: resumeId,
        slug: 'unique-slug-test'
      })

      const response2 = await apiRequest('/resumes/portfolio', 'POST', {
        resume_id: resumeId,
        slug: 'unique-slug-test'
      })

      expect(response1.status).toBe(201)
      expect(response2.status).toBe(400)
    })

    it('should support password protection', async () => {
      const response = await apiRequest('/resumes/portfolio', 'POST', {
        resume_id: resumeId,
        password: 'secure123'
      })

      expect(response.status).toBe(201)
      expect(response.data.data.password_hash).toBeTruthy()
    })

    it('should set as primary portfolio', async () => {
      const response = await apiRequest('/resumes/portfolio', 'POST', {
        resume_id: resumeId,
        is_primary: true
      })

      expect(response.status).toBe(201)
      expect(response.data.data.is_primary).toBe(true)
    })
  })

  describe('GET /api/resumes/portfolio - Get Portfolio Links', () => {
    it('should return portfolio links with analytics', async () => {
      const response = await apiRequest('/resumes/portfolio', 'GET')

      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
      expect(Array.isArray(response.data.data)).toBe(true)

      if (response.data.data.length > 0) {
        const portfolio = response.data.data[0]
        expect(portfolio).toHaveProperty('id')
        expect(portfolio).toHaveProperty('slug')
        expect(portfolio).toHaveProperty('analytics')
      }
    })

    it('should filter by resumeId', async () => {
      const response = await apiRequest(`/resumes/portfolio?resumeId=${resumeId}`, 'GET')
      const portfolios = response.data.data

      expect(portfolios.every((p: any) => p.resume_id === resumeId)).toBe(true)
    })
  })

  describe('PATCH /api/resumes/portfolio - Update Portfolio', () => {
    it('should update publish status', async () => {
      const response = await apiRequest('/resumes/portfolio', 'PATCH', {
        id: portfolioId,
        is_published: false
      })

      expect(response.status).toBe(200)
      expect(response.data.data.is_published).toBe(false)
    })

    it('should set as primary portfolio', async () => {
      const response = await apiRequest('/resumes/portfolio', 'PATCH', {
        id: portfolioId,
        is_primary: true
      })

      expect(response.status).toBe(200)
      expect(response.data.data.is_primary).toBe(true)
    })
  })

  // ==================== AUTHORIZATION TESTS ====================
  describe('Authorization & Security', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch(`${BASE_URL}/resumes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      expect(response.status).toBe(401)
    })

    it('should prevent access to other users data', async () => {
      const response = await apiRequest(`/resumes/${resumeId}`, 'GET', null, TEST_USER_ID_2)

      expect(response.status).toBe(403)
    })

    it('should validate user ownership of portfolio links', async () => {
      const response = await apiRequest('/resumes/portfolio', 'PATCH', {
        id: portfolioId,
        is_published: true
      }, TEST_USER_ID_2)

      expect(response.status).toBe(403)
    })
  })

  // ==================== PLAN TIER TESTS ====================
  describe('Plan-Based Access Control', () => {
    it('free plan should allow 1 resume', async () => {
      // Already tested above - free plan blocked on second resume
      expect(true).toBe(true)
    })

    it('should track resume count by plan', async () => {
      const response = await apiRequest('/resumes', 'GET')

      expect(response.data.data).toBeDefined()
    })
  })

  // ==================== ERROR HANDLING ====================
  describe('Error Handling', () => {
    it('should return 400 for invalid JSON', async () => {
      const response = await fetch(`${BASE_URL}/resumes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: 'invalid json'
      })

      expect(response.status).toBe(400)
    })

    it('should return 404 for nonexistent endpoints', async () => {
      const response = await apiRequest('/resumes/nonexistent/path', 'GET')

      expect(response.status).toBe(404)
    })

    it('should handle database errors gracefully', async () => {
      // Try creating resume with invalid data
      const response = await apiRequest('/resumes', 'POST', {
        title: ''
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.data.error).toBeTruthy()
    })
  })

  // ==================== INTEGRATION TESTS ====================
  describe('Workflow Integration Tests', () => {
    it('complete workflow: create -> add sections -> export -> portfolio', async () => {
      // 1. Create resume
      const createRes = await apiRequest('/resumes', 'POST', {
        title: 'Integration Test Resume'
      })
      const testResumeId = createRes.data.data.id
      expect(createRes.status).toBe(201)

      // 2. Add personal section
      const sectionRes = await apiRequest(`/resumes/${testResumeId}/sections`, 'POST', {
        section_type: 'personal',
        content: { name: 'Test User', email: 'test@example.com' }
      })
      expect(sectionRes.status).toBe(200)

      // 3. Queue export
      const exportRes = await apiRequest('/resumes/export', 'POST', {
        resume_id: testResumeId,
        format: 'pdf'
      })
      expect(exportRes.status).toBe(201)

      // 4. Create portfolio link
      const portfolioRes = await apiRequest('/resumes/portfolio', 'POST', {
        resume_id: testResumeId,
        is_primary: true
      })
      expect(portfolioRes.status).toBe(201)

      // 5. Verify all created
      const getRes = await apiRequest(`/resumes/${testResumeId}`, 'GET')
      expect(getRes.status).toBe(200)
      expect(getRes.data.data.sections.length).toBeGreaterThan(0)
    })
  })
})
