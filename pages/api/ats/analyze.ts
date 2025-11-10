import type { NextApiRequest, NextApiResponse } from 'next'

interface ATSAnalysisResponse {
  success: boolean
  data?: {
    score: number
    matchPercentage: number
    keywords: {
      present: string[]
      missing: string[]
      frequency: Record<string, number>
    }
    sections: {
      hasContactInfo: boolean
      hasEducation: boolean
      hasExperience: boolean
      hasSkills: boolean
      hasProjects: boolean
    }
    issues: {
      critical: string[]
      warnings: string[]
      suggestions: string[]
    }
    atsScore: {
      formatting: number
      keywords: number
      sections: number
      overall: number
    }
  }
  error?: string
}

// Industry-standard keywords for different roles
const INDUSTRY_KEYWORDS = {
  technical: [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby',
    'golang', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
    'groovy', 'haskell', 'clojure', 'elixir',
    
    // Frontend Frameworks & Libraries
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby',
    'remix', 'ember', 'backbone', 'knockout', 'alpine',
    
    // Backend Frameworks
    'node.js', 'express', 'django', 'flask', 'spring', 'spring boot',
    'laravel', 'symfony', 'asp.net', 'fastapi', 'nestjs', 'rails',
    'sinatra', 'gorilla', 'gin', 'fiber', 'echo',
    
    // Databases
    'sql', 'mongodb', 'postgresql', 'mysql', 'mariadb', 'sqlite',
    'oracle', 'elasticsearch', 'cassandra', 'redis', 'memcached',
    'firebase', 'dynamodb', 'cosmos db', 'couchdb', 'influxdb',
    'neo4j', 'arangodb', 'solr', 'supabase',
    
    // Cloud Platforms
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel',
    'netlify', 'render', 'railway', 'linode', 'digitalocean',
    'ibm cloud', 'oracle cloud', 'alibaba cloud', 'aws ec2', 'aws lambda',
    'aws s3', 'azure app service', 'gcp compute',
    
    // DevOps & Infrastructure
    'docker', 'kubernetes', 'ci/cd', 'jenkins', 'gitlab ci', 'github actions',
    'circleci', 'travis ci', 'terraform', 'ansible', 'puppet', 'chef',
    'prometheus', 'grafana', 'elk stack', 'datadog', 'new relic',
    'splunk', 'argocd', 'helm', 'nginx', 'apache', 'linux',
    
    // Version Control & Tools
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
    'svn', 'mercurial', 'perforce', 'trello', 'asana',
    
    // API & Web Protocols
    'rest', 'restful', 'graphql', 'grpc', 'websocket', 'mqtt',
    'soap', 'odata', 'json', 'xml', 'protobuf', 'http/2', 'http/3',
    
    // Frontend Technologies
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material ui',
    'semantic ui', 'bulma', 'foundation', 'webpack', 'babel', 'esbuild',
    'vite', 'parcel', 'browserify', 'rollup', 'prettier', 'eslint',
    
    // Testing & QA
    'jest', 'testing', 'vitest', 'mocha', 'chai', 'jasmine', 'karma',
    'cypress', 'playwright', 'selenium', 'appium', 'junit', 'pytest',
    'unittest', 'rspec', 'phpunit', 'testng', 'jest', 'enzyme',
    'react testing library', 'supertest', 'postman',
    
    // Methodologies
    'agile', 'scrum', 'kanban', 'lean', 'waterfall', 'devops',
    'microservices', 'monolith', 'serverless', 'jam stack',
    
    // Architecture Patterns
    'api', 'database', 'microservices', 'serverless', 'graphql',
    'event-driven', 'pub-sub', 'message queue', 'cqrs', 'saga',
    'api gateway', 'service mesh', 'load balancer', 'cache',
    
    // Message Queues & Streaming
    'redis', 'rabbitmq', 'kafka', 'activemq', 'ibm mq', 'nats',
    'aws sqs', 'aws sns', 'google pubsub', 'azure servicebus',
    
    // Security & Authentication
    'oauth', 'oauth2', 'openid connect', 'jwt', 'saml', 'kerberos',
    'ldap', 'ssl/tls', 'https', 'encryption', 'hashing', 'bcrypt',
    'argon2', 'cors', 'csrf', 'xss', 'sql injection',
    
    // Data & Analytics
    'data', 'analytics', 'big data', 'hadoop', 'spark', 'hive',
    'pig', 'presto', 'dbt', 'etl', 'data warehouse', 'data lake',
    'tableau', 'power bi', 'looker', 'metabase', 'superset',
    
    // Machine Learning & AI
    'machine learning', 'deep learning', 'tensorflow', 'pytorch',
    'keras', 'scikit-learn', 'numpy', 'pandas', 'matplotlib',
    'nlp', 'computer vision', 'neural network', 'ai', 'ml',
    
    // Mobile Development
    'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin',
    'xamarin', 'ionic', 'cordova', 'mobile app development',
    
    // CMS & E-commerce
    'wordpress', 'drupal', 'joomla', 'shopify', 'woocommerce',
    'magento', 'prestashop', 'contentful', 'strapi', 'ghost',
    
    // Additional Tech Skills
    'agile', 'scrum master', 'product owner', 'architecture',
    'design patterns', 'solid principles', 'oop', 'functional programming',
    'reactive programming', 'async await', 'promises', 'callbacks',
    'regular expressions', 'debugging', 'profiling', 'optimization'
  ],
  
  business: [
    // Leadership & Management
    'leadership', 'management', 'team leadership', 'strategic planning',
    'executive', 'director level', 'c-level', 'vp', 'ceo', 'cto', 'cfo',
    'project management', 'product management', 'program management',
    
    // Strategy & Planning
    'strategy', 'strategic thinking', 'business strategy',
    'business development', 'market analysis', 'competitive analysis',
    'business planning', 'roadmap development', 'goal setting',
    'kpi', 'okg', 'metrics', 'analytics',
    
    // Sales & Marketing
    'sales', 'business development', 'marketing', 'digital marketing',
    'content marketing', 'social media marketing', 'email marketing',
    'seo', 'sem', 'ppc', 'conversion optimization', 'customer acquisition',
    'brand management', 'market positioning', 'go-to-market',
    
    // Customer & Client Management
    'customer relations', 'customer service', 'account management',
    'client management', 'customer success', 'customer support',
    'crm', 'customer experience', 'stakeholder management',
    'vendor management', 'partner management',
    
    // Financial & Operations
    'budget management', 'budgeting', 'financial planning',
    'roi', 'cost control', 'profit maximization', 'revenue',
    'operations', 'supply chain', 'inventory management',
    'procurement', 'logistics', 'data analysis',
    
    // Organizational Skills
    'organization', 'process improvement', 'workflow optimization',
    'efficiency improvement', 'quality assurance', 'quality control',
    'risk management', 'compliance', 'governance',
    
    // Communication & Interpersonal
    'communication', 'negotiation', 'presentation skills',
    'stakeholder communication', 'public speaking', 'writing',
    'technical writing', 'documentation', 'reporting',
    
    // Collaboration & Teamwork
    'teamwork', 'collaboration', 'cooperation', 'team player',
    'cross-functional collaboration', 'interdepartmental',
    'workplace culture', 'diversity and inclusion',
    
    // Decision Making & Problem Solving
    'decision-making', 'problem-solving', 'analytical thinking',
    'critical thinking', 'strategic thinking', 'creative thinking',
    'root cause analysis', 'troubleshooting', 'conflict resolution',
    
    // Industry Specific
    'business acumen', 'industry knowledge', 'domain expertise',
    'market awareness', 'competitive intelligence', 'trend analysis',
    'forecasting', 'scenario planning', 'change management',
    
    // HR & Talent
    'recruiting', 'hiring', 'talent acquisition', 'employee retention',
    'training and development', 'performance management', 'mentoring',
    'coaching', 'talent management', 'succession planning',
    
    // Additional Business Skills
    'consulting', 'business consulting', 'process consulting',
    'technology consulting', 'advisory', 'strategic advising',
    'business intelligence', 'data-driven decision making',
    'innovation management', 'product launch', 'market research'
  ],
  
  soft_skills: [
    // Communication
    'communication', 'active listening', 'verbal communication',
    'written communication', 'presentation', 'storytelling',
    'clarity', 'articulate', 'concise', 'persuasion', 'influence',
    
    // Teamwork & Collaboration
    'teamwork', 'collaboration', 'cooperation', 'team player',
    'collective problem solving', 'group dynamics', 'cooperation',
    'team building', 'mutual respect', 'interdependence',
    
    // Leadership
    'leadership', 'vision', 'inspiration', 'motivation', 'mentoring',
    'coaching', 'delegation', 'empowerment', 'initiative', 'drive',
    
    // Problem Solving & Analysis
    'problem-solving', 'critical thinking', 'analytical thinking',
    'strategic thinking', 'creative thinking', 'innovation',
    'root cause analysis', 'troubleshooting', 'logical thinking',
    
    // Personal Development
    'adaptability', 'flexibility', 'openness', 'learning agility',
    'self-motivated', 'self-directed', 'self-awareness', 'resilience',
    'growth mindset', 'continuous learning', 'intellectual curiosity',
    
    // Attention to Detail
    'attention to detail', 'accuracy', 'precision', 'thoroughness',
    'meticulousness', 'eye for detail', 'quality focus',
    
    // Time Management
    'time management', 'prioritization', 'organization', 'planning',
    'scheduling', 'deadline management', 'multitasking',
    'work ethic', 'productivity',
    
    // Creativity & Innovation
    'creativity', 'innovation', 'creative thinking', 'original thinking',
    'brainstorming', 'ideation', 'design thinking', 'lateral thinking',
    
    // Emotional Intelligence
    'emotional intelligence', 'empathy', 'social awareness',
    'relationship management', 'self-regulation', 'self-control',
    'maturity', 'professionalism', 'reliability', 'trustworthiness',
    
    // Conflict Resolution
    'conflict resolution', 'negotiation', 'diplomacy', 'mediation',
    'win-win thinking', 'compromise', 'assertiveness',
    
    // Customer Focus
    'customer focus', 'customer service', 'user empathy',
    'customer-centric', 'service orientation', 'responsiveness',
    
    // Accountability
    'accountability', 'responsibility', 'ownership', 'reliability',
    'follow-through', 'commitment', 'integrity', 'honesty',
    
    // Collaboration Skills
    'networking', 'relationship building', 'interpersonal skills',
    'people skills', 'social skills', 'charm', 'charisma',
    
    // Additional Soft Skills
    'humility', 'coachability', 'feedback receptiveness',
    'positive attitude', 'enthusiasm', 'patience', 'compassion',
    'gratitude', 'humility', 'common sense', 'practicality'
  ]
}

// Common action verbs (strong resume words)
const ACTION_VERBS = [
  'achieved', 'accelerated', 'accomplished', 'adapted', 'analyzed', 'approved',
  'assessed', 'assigned', 'assisted', 'attained', 'audited', 'authored',
  'automated', 'awarded', 'built', 'calculated', 'centralized', 'certified',
  'chaired', 'clarified', 'closed', 'coached', 'collaborated', 'collected',
  'combined', 'commanded', 'communicated', 'compiled', 'completed', 'composed',
  'computed', 'conceived', 'conceptualized', 'concluded', 'conducted', 'configured',
  'confirmed', 'consolidated', 'constructed', 'consulted', 'contacted', 'contrived',
  'controlled', 'converted', 'coordinated', 'corrected', 'corresponded', 'created',
  'decreased', 'defined', 'delegated', 'delivered', 'demonstrated', 'derived',
  'described', 'designed', 'determined', 'developed', 'devised', 'diagnosed',
  'diagrammed', 'directed', 'discovered', 'discussed', 'displayed', 'dissolved',
  'distinguished', 'distributed', 'diversified', 'documented', 'dominated'
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ATSAnalysisResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { resumeText, jobDescription } = req.body

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Resume text and job description are required'
      })
    }

    // Extract text and analyze
    const resumeAnalysis = analyzeResume(resumeText)
    const jobKeywords = extractKeywords(jobDescription)
    const matchAnalysis = analyzeKeywordMatch(resumeAnalysis, jobKeywords)

    res.status(200).json({
      success: true,
      data: {
        score: matchAnalysis.score,
        matchPercentage: matchAnalysis.matchPercentage,
        keywords: matchAnalysis.keywords,
        sections: detectSections(resumeText),
        issues: detectIssues(resumeAnalysis, matchAnalysis),
        atsScore: calculateATSScore(resumeAnalysis, matchAnalysis)
      }
    })
  } catch (error) {
    console.error('ATS Analysis error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to analyze resume'
    })
  }
}

// Helper function to escape regex special characters
const escapeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function analyzeResume(text: string) {
  const lowerText = text.toLowerCase()
  
  const foundKeywords = {
    technical: INDUSTRY_KEYWORDS.technical.filter(k => 
      lowerText.includes(k.toLowerCase())
    ),
    business: INDUSTRY_KEYWORDS.business.filter(k =>
      lowerText.includes(k.toLowerCase())
    ),
    soft_skills: INDUSTRY_KEYWORDS.soft_skills.filter(k =>
      lowerText.includes(k.toLowerCase())
    )
  }

  const actionVerbsFound = ACTION_VERBS.filter(v => {
    try {
      const escapedVerb = escapeRegex(v)
      return new RegExp(`\\b${escapedVerb}\\b`).test(lowerText)
    } catch (e) {
      return lowerText.includes(v.toLowerCase())
    }
  })

  const wordCount = text.split(/\s+/).length
  const lines = text.split('\n').length
  
  // Calculate keyword frequency
  const frequency: Record<string, number> = {}
  const allKeywords = [
    ...INDUSTRY_KEYWORDS.technical,
    ...INDUSTRY_KEYWORDS.business,
    ...INDUSTRY_KEYWORDS.soft_skills
  ]
  
  allKeywords.forEach(keyword => {
    try {
      const escapedKeyword = escapeRegex(keyword)
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi')
      const matches = text.match(regex)
      if (matches) {
        frequency[keyword] = matches.length
      }
    } catch (e) {
      // Skip keywords that cause regex errors
      console.error(`Regex error for keyword: ${keyword}`, e)
    }
  })

  return {
    foundKeywords,
    actionVerbsFound,
    wordCount,
    lines,
    frequency,
    hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
    hasPhone: /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
    hasLinkedIn: /linkedin\.com|linkedin profile/i.test(text),
    hasUrl: /https?:\/\/[^\s]+/.test(text)
  }
}

function extractKeywords(jobDescription: string): {
  keywords: string[]
  frequency: Record<string, number>
} {
  const lowerText = jobDescription.toLowerCase()
  
  // Extract keywords from job description
  const allIndustryKeywords = [
    ...INDUSTRY_KEYWORDS.technical,
    ...INDUSTRY_KEYWORDS.business,
    ...INDUSTRY_KEYWORDS.soft_skills
  ]
  
  const foundKeywords = allIndustryKeywords.filter(k =>
    lowerText.includes(k.toLowerCase())
  )

  const frequency: Record<string, number> = {}
  foundKeywords.forEach(keyword => {
    try {
      const escapedKeyword = escapeRegex(keyword)
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi')
      const matches = jobDescription.match(regex)
      if (matches) {
        frequency[keyword] = matches.length
      }
    } catch (e) {
      // Skip keywords that cause regex errors
      console.error(`Regex error for keyword: ${keyword}`, e)
    }
  })

  return {
    keywords: foundKeywords,
    frequency
  }
}

function analyzeKeywordMatch(resumeAnalysis: any, jobKeywords: any) {
  const allResumeKeywords = [
    ...resumeAnalysis.foundKeywords.technical,
    ...resumeAnalysis.foundKeywords.business,
    ...resumeAnalysis.foundKeywords.soft_skills
  ]

  const presentKeywords = jobKeywords.keywords.filter((k: string) =>
    allResumeKeywords.some(rk => rk.toLowerCase() === k.toLowerCase())
  )

  const missingKeywords = jobKeywords.keywords.filter((k: string) =>
    !allResumeKeywords.some(rk => rk.toLowerCase() === k.toLowerCase())
  )

  const matchPercentage = jobKeywords.keywords.length > 0
    ? Math.round((presentKeywords.length / jobKeywords.keywords.length) * 100)
    : 0

  // Calculate ATS score based on matches
  const score = Math.min(100, Math.max(0, matchPercentage))

  const frequency: Record<string, number> = {}
  presentKeywords.forEach((keyword: string) => {
    frequency[keyword] = (resumeAnalysis.frequency[keyword] || 0) +
                         (jobKeywords.frequency[keyword] || 0)
  })

  return {
    score,
    matchPercentage,
    keywords: {
      present: presentKeywords,
      missing: missingKeywords,
      frequency
    }
  }
}

function detectSections(text: string): { hasContactInfo: boolean; hasEducation: boolean; hasExperience: boolean; hasSkills: boolean; hasProjects: boolean } {
  const lowerText = text.toLowerCase()
  
  return {
    hasContactInfo: /email|phone|contact|linkedin/i.test(text),
    hasEducation: /education|degree|bachelor|master|university|college|high school/i.test(text),
    hasExperience: /experience|employment|worked|position|role|company|job/i.test(text),
    hasSkills: /skills?|proficiencies?|technical skills|competencies/i.test(text),
    hasProjects: /projects?|portfolio|github|achievement|accomplishment/i.test(text)
  }
}

function detectIssues(resumeAnalysis: any, matchAnalysis: any) {
  const critical: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Critical issues
  if (!resumeAnalysis.hasEmail) {
    critical.push('Email address not found - ATS systems need this for contact')
  }
  if (!resumeAnalysis.hasPhone) {
    critical.push('Phone number not found - Consider adding it for better ATS compatibility')
  }

  // Warnings
  if (matchAnalysis.keywords.missing.length > matchAnalysis.keywords.present.length) {
    warnings.push(`Only ${matchAnalysis.matchPercentage}% keyword match with job description`)
  }
  if (resumeAnalysis.actionVerbsFound.length < 10) {
    warnings.push('Resume uses few action verbs - Consider using more dynamic language')
  }
  if (resumeAnalysis.wordCount < 300) {
    warnings.push('Resume is quite short - May not contain enough keywords')
  }
  if (resumeAnalysis.wordCount > 1000) {
    warnings.push('Resume is very long - ATS systems may have difficulty parsing it')
  }

  // Suggestions
  if (matchAnalysis.keywords.missing.length > 0) {
    suggestions.push(`Add missing keywords: ${matchAnalysis.keywords.missing.slice(0, 5).join(', ')}`)
  }
  if (!resumeAnalysis.hasLinkedIn) {
    suggestions.push('Consider adding your LinkedIn profile URL')
  }
  if (resumeAnalysis.foundKeywords.technical.length < 5) {
    suggestions.push('Add more technical skills to improve ATS compatibility')
  }

  return {
    critical,
    warnings,
    suggestions
  }
}

function calculateATSScore(resumeAnalysis: any, matchAnalysis: any) {
  // Formatting score (0-25)
  let formatting = 15
  if (resumeAnalysis.hasEmail) formatting += 5
  if (resumeAnalysis.hasPhone) formatting += 5

  // Keywords score (0-35)
  const keywords = matchAnalysis.matchPercentage

  // Sections score (0-25)
  let sections = 0
  if (matchAnalysis.keywords) sections += 25

  // Action verbs bonus (0-15)
  let actionVerbs = Math.min(15, resumeAnalysis.actionVerbsFound.length)

  const overall = Math.min(100, 
    Math.round((formatting * 0.25 + keywords * 0.35 + sections * 0.25 + actionVerbs * 0.15) / 100 * 100)
  )

  return {
    formatting,
    keywords: Math.round(keywords),
    sections,
    overall
  }
}
