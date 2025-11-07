import { z } from 'zod';

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

export const oauthSchema = z.object({
  provider: z.enum(['google', 'linkedin', 'github']),
  code: z.string().min(1, 'Authorization code is required'),
  redirectUri: z.string().url('Invalid redirect URI'),
});

// Resume schemas
export const resumeCreateSchema = z.object({
  title: z.string().min(1, 'Resume title is required'),
  template: z.string().min(1, 'Template is required'),
  data: z.object({
    personalInfo: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      phone: z.string().min(1, 'Phone is required'),
      location: z.string().min(1, 'Location is required'),
      linkedin: z.string().url().optional(),
      website: z.string().url().optional(),
    }),
    summary: z.string().max(500, 'Summary must be less than 500 characters'),
    experience: z.array(z.object({
      title: z.string().min(1, 'Job title is required'),
      company: z.string().min(1, 'Company is required'),
      location: z.string().min(1, 'Location is required'),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().min(1, 'End date is required'),
      description: z.string().min(1, 'Description is required'),
    })),
    education: z.array(z.object({
      degree: z.string().min(1, 'Degree is required'),
      school: z.string().min(1, 'School is required'),
      location: z.string().min(1, 'Location is required'),
      graduationDate: z.string().min(1, 'Graduation date is required'),
      gpa: z.string().optional(),
    })),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
  }),
});

export const resumeUpdateSchema = resumeCreateSchema.partial().extend({
  id: z.string().min(1, 'Resume ID is required'),
});

// Portfolio schemas
export const portfolioCreateSchema = z.object({
  title: z.string().min(1, 'Portfolio title is required'),
  template: z.string().min(1, 'Template is required'),
  data: z.object({
    personalInfo: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      bio: z.string().max(1000, 'Bio must be less than 1000 characters'),
      avatar: z.string().url().optional(),
      socialLinks: z.array(z.object({
        platform: z.string(),
        url: z.string().url(),
      })).optional(),
    }),
    projects: z.array(z.object({
      title: z.string().min(1, 'Project title is required'),
      description: z.string().min(1, 'Project description is required'),
      technologies: z.array(z.string()),
      githubUrl: z.string().url().optional(),
      liveUrl: z.string().url().optional(),
      images: z.array(z.string().url()).optional(),
    })),
    experience: z.array(z.object({
      title: z.string().min(1, 'Job title is required'),
      company: z.string().min(1, 'Company is required'),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().optional(),
      description: z.string().min(1, 'Description is required'),
    })),
  }),
});

// Credit schemas
export const creditPurchaseSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
});

export const creditUsageSchema = z.object({
  action: z.enum(['resume_create', 'resume_export', 'ats_check', 'portfolio_create']),
  resumeId: z.string().optional(),
  portfolioId: z.string().optional(),
});

// ATS schemas
export const atsCheckSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
});

// Validation helper functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Invalid data format'] };
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};