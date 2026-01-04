// Resume types
export interface Resume {
  id: string;
  user_id: string;
  title: string;
  job_title?: string;
  is_primary: boolean;
  template_id?: string;
  theme_color?: string;
  settings?: {
    font?: string;
    secondary_color?: string;
    hidden_sections?: string[];
    [key: string]: any;
  };
  sections?: any[];
  created_at: string;
  updated_at: string;
}

export interface ResumeSection {
  id: string;
  resume_id: string;
  section_type:
    | "experience"
    | "education"
    | "skills"
    | "projects"
    | "certifications"
    | "summary"
    | "personal_info"
    | "languages"
    | "achievements"
    | "declaration"
    | "custom"
    | string;
  title: string;
  content: any;
  section_data?: any; // Add this for compatibility with API before mapping
  order_index: number;
}

// Portfolio types
export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  slug?: string;
  resume_id: string;
  repo?: string;
  url?: string;
  theme?: string;
  theme_color?: string;
  template_id?: string;
  settings?: {
    visibleSections?: string[];
    showPhoto?: boolean;
    photoUrl?: string;
    customTitle?: string;
    customUser?: string;
    [key: string]: any;
  };
  is_active: boolean;
  views?: number;
  created_at: string;
  updated_at: string;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  is_premium: boolean;
}

// Credit transaction types
export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: "purchase" | "usage" | "refund";
  description: string;
  created_at: string;
}

// User profile types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  credits: number;
  plan: "free" | "starter" | "pro" | "pro_plus" | "enterprise";
  created_at: string;
  updated_at: string;
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ATSAnalysisRecord {
  id: string;
  user_id?: string;
  resume_text: string;
  job_description: string;
  score: number;
  match_percentage: number;
  keywords_found: string[];
  keywords_missing: string[];
  created_at: string;
}

// Cover Letter types
export interface CoverLetter {
  id: string;
  user_id: string;
  title: string;
  content: string; // Markdown or HTML
  content_short?: string; // Short version (e.g. for LinkedIn)
  resume_id?: string;
  job_description?: string;
  company_name?: string;
  job_title?: string;
  created_at: string;
  updated_at: string;
}
