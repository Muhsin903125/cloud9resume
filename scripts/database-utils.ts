// Database utility script for running migrations and schema operations
// Usage: npx ts-node scripts/database-utils.ts [command]

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', 'frontend', '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars: { [key: string]: string } = {}
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
    return envVars
  }
  return {}
}

const envVars = loadEnv()
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSchema() {
  try {
    console.log('🚀 Running database schema...')

    const schemaPath = path.join(__dirname, '..', 'database-schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

    // Split SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error('Error executing statement:', error)
        }
      }
    }

    console.log('✅ Schema execution completed')
  } catch (error) {
    console.error('❌ Schema execution failed:', error)
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...')

    const migrationPath = path.join(__dirname, '..', 'database-migrations.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error('Error executing statement:', error)
        }
      }
    }

    console.log('✅ Migration execution completed')
  } catch (error) {
    console.error('❌ Migration execution failed:', error)
  }
}

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...')

    const tables = ['profiles', 'credit_usage', 'resumes', 'portfolios', 'ats_results']

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ Table '${table}' error:`, error.message)
      } else {
        console.log(`✅ Table '${table}' exists (${data?.length || 0} records)`)
      }
    }
  } catch (error) {
    console.error('❌ Table check failed:', error)
  }
}

async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'schema':
      await runSchema()
      break
    case 'migrate':
      await runMigrations()
      break
    case 'check':
      await checkTables()
      break
    default:
      console.log('Usage: npx ts-node scripts/database-utils.ts [command]')
      console.log('Commands:')
      console.log('  schema  - Run the main database schema')
      console.log('  migrate - Run database migrations')
      console.log('  check   - Check if all tables exist')
      break
  }
}

main().catch(console.error)