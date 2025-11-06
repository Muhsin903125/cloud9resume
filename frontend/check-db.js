// Check Database for New User
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from frontend and backend .env files
function loadEnv() {
  const envVars = {}
  
  // Load frontend .env
  const frontendEnvPath = path.join(__dirname, '.env')
  if (fs.existsSync(frontendEnvPath)) {
    const envContent = fs.readFileSync(frontendEnvPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
  }
  
  // Load backend .env for service role key
  const backendEnvPath = path.join(__dirname, '..', 'backend', '.env')
  if (fs.existsSync(backendEnvPath)) {
    const envContent = fs.readFileSync(backendEnvPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
  }
  
  return envVars
}

const envVars = loadEnv()
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('   URL:', !!supabaseUrl)
  console.error('   Service Key:', !!supabaseServiceKey)
  process.exit(1)
}

// Create client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  try {
    console.log('🔍 Checking database for user data...')

    // Check auth users
    console.log('\n👤 Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.log('⚠️  Cannot check auth.users (requires service role key)')
    } else {
      console.log(`📊 Found ${authUsers.users.length} users in auth`)
      // Show recent users
      const recentUsers = authUsers.users.slice(-3)
      recentUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`)
      })
    }

    // Check profiles table
    console.log('\n👥 Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError.message)
    } else {
      console.log(`📊 Found ${profiles.length} profiles in database`)
      profiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.first_name} ${profile.last_name}) - ${profile.credits} credits`)
      })
    }

    // Check credit_usage table
    console.log('\n💰 Checking credit_usage table...')
    const { data: credits, error: creditsError } = await supabase
      .from('credit_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (creditsError) {
      console.error('❌ Error querying credit_usage:', creditsError.message)
    } else {
      console.log(`📊 Found ${credits.length} credit records`)
      credits.forEach(credit => {
        console.log(`   - ${credit.action}: ${credit.credits_used} credits used`)
      })
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message)
  }
}

checkDatabase()