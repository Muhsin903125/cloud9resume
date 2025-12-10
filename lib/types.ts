// Resume types
export interface Resume {
  id: string
  user_id: string
  title: string
  job_title?: string
  is_primary: boolean
  template_id?: string
  theme_color?: string
  created_at: string
  updated_at: string
}

export interface ResumeSection {
  id: string
  resume_id: string
  section_type: 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'custom'
  title: string
  content: any
  order_index: number
}

// Portfolio types
export interface Portfolio {
  id: string
  user_id: string
  slug: string
  resume_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Template types
export interface Template {
  id: string
  name: string
  description: string
  thumbnail_url?: string
  category: string
  is_premium: boolean
}

// Credit transaction types
export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  transaction_type: 'purchase' | 'usage' | 'refund'
  description: string
  created_at: string
}

// User profile types
export interface UserProfile {
  id: string
  email: string
  name?: string
  first_name?: string
  last_name?: string
  credits: number
  plan: 'free' | 'basic' | 'premium'
  created_at: string
  updated_at: string
}

// API response types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ATSAnalysisRecord {
  id: string
  user_id?: string
  resume_text: string
  job_description: string
  score: number
  match_percentage: number
  keywords_found: string[]
  keywords_missing: string[]
  created_at: string
}
