# Database Migrations

This directory contains SQL migration scripts for database schema changes.

## Migration Files

### 001_add_oauth_support.sql
Adds OAuth support to the profiles table including:
- `provider` - OAuth provider (email, google, github, etc.)
- `provider_id` - Unique ID from OAuth provider
- `auth_method` - Authentication method used
- `oauth_data` - JSON data from OAuth provider
- `last_login_at` - Timestamp of last login
- `login_count` - Total number of logins
- `oauth_audit_log` table for tracking OAuth logins

## Running Migrations

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Environment variables set:
  ```bash
  export SUPABASE_URL=your_supabase_url
  export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

### On macOS/Linux
```bash
chmod +x db/run-migrations.sh
./db/run-migrations.sh
```

### On Windows
```bash
db\run-migrations.bat
```

### Manual Execution
If you prefer to run migrations manually:

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Create new query
   - Copy and paste the SQL from the migration file
   - Run the query

2. **Via Supabase CLI:**
   ```bash
   supabase db push --file db/migrations/001_add_oauth_support.sql
   ```

3. **Via psql (PostgreSQL CLI):**
   ```bash
   psql "postgresql://user:password@host:port/database" -f db/migrations/001_add_oauth_support.sql
   ```

## Migration Naming Convention

Migrations follow the pattern: `NNN_description.sql`
- `NNN` - Sequential number (001, 002, 003, etc.)
- `description` - Brief description of changes

## Schema Changes

### Profiles Table Updates

**New Columns:**
```sql
- provider TEXT DEFAULT 'email'
- provider_id TEXT
- auth_method TEXT DEFAULT 'email'
- oauth_data JSONB
- last_login_at TIMESTAMP WITH TIME ZONE
- login_count INTEGER DEFAULT 0
```

**New Indexes:**
```sql
- idx_profiles_provider_id (provider, provider_id)
- idx_profiles_email (email)
- idx_profiles_last_login_at (last_login_at DESC)
```

### New Tables

**oauth_audit_log:**
Tracks all OAuth login attempts for security auditing.

```sql
- id UUID PRIMARY KEY
- user_id UUID (FK to auth.users)
- provider TEXT
- provider_id TEXT
- login_at TIMESTAMP WITH TIME ZONE
- ip_address TEXT
- user_agent TEXT
- created_at TIMESTAMP WITH TIME ZONE
```

## Rollback

To rollback a migration, create a reverse migration file:

**002_rollback_oauth_support.sql:**
```sql
-- Rollback OAuth support
ALTER TABLE profiles DROP COLUMN IF EXISTS provider;
ALTER TABLE profiles DROP COLUMN IF EXISTS provider_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS auth_method;
ALTER TABLE profiles DROP COLUMN IF EXISTS oauth_data;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_login_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS login_count;

DROP TABLE IF EXISTS oauth_audit_log;
DROP INDEX IF EXISTS idx_profiles_provider_id;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_last_login_at;
```

## Verification

After running migrations, verify the changes:

```sql
-- Check profiles table structure
\d profiles

-- Check new indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'profiles';

-- Check oauth_audit_log table
\d oauth_audit_log

-- Verify data
SELECT COUNT(*) FROM profiles;
```

## Best Practices

1. **Always backup** your database before running migrations
2. **Test migrations** in a development environment first
3. **Run migrations during low traffic** periods
4. **Keep migration files immutable** - don't modify existing migrations
5. **Document schema changes** in the migration file
6. **Create appropriate indexes** for query performance
7. **Set sensible defaults** for new columns

## Environment Variables

Required for migration scripts:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: For direct psql connections
PGHOST=your-project.supabase.co
PGUSER=postgres
PGPASSWORD=your-password
PGDATABASE=postgres
```

## Troubleshooting

### Migration fails with "permission denied"
- Ensure you're using the service role key (not anon key)
- Service role key has admin privileges

### "Table already exists" error
- Migrations use `IF NOT EXISTS` to be idempotent
- Safe to re-run migrations

### Supabase CLI not found
```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

### Connection refused
- Verify SUPABASE_URL is correct
- Check internet connection
- Ensure service role key is valid

## Support

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/migrations/intro)
