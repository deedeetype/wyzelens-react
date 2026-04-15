/**
 * Apply Supabase Migration
 * Creates competitor_intelligence table
 */

import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://erkzlqgpbrxokyqtrgnf.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVya3pscWdwYnJ4b2t5cXRyZ25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI4NTc4NSwiZXhwIjoyMDg2ODYxNzg1fQ.kiM7vc9skIxZcSnKVPnnue67TQGBRaNX68ZuCDAVAqs'

async function applyMigration() {
  console.log('📊 Applying Supabase Migration...\n')
  
  // Read migration SQL
  const sql = readFileSync('./supabase/migrations/create_competitor_intelligence.sql', 'utf8')
  
  console.log('Migration SQL length:', sql.length, 'characters')
  console.log('━'.repeat(60))
  
  try {
    // Execute via Supabase REST API (using rpc endpoint)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    })
    
    if (!response.ok) {
      // If rpc/exec_sql doesn't exist, use direct query
      console.log('⚠️  RPC endpoint not available, using direct SQL execution...\n')
      
      // Split into individual statements and execute
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      console.log(`Found ${statements.length} SQL statements to execute\n`)
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';'
        console.log(`[${i + 1}/${statements.length}] Executing...`)
        
        // Use pg_query endpoint if available, otherwise manual execution needed
        console.log('⚠️  Manual execution required via Supabase SQL Editor')
        console.log('Please copy the migration file content and run it in:')
        console.log('https://supabase.com/dashboard/project/erkzlqgpbrxokyqtrgnf/sql/new')
        break
      }
    } else {
      const data = await response.json()
      console.log('✅ Migration applied successfully!')
      console.log('Response:', data)
    }
    
  } catch (error) {
    console.error('❌ Migration failed:')
    console.error(error.message)
    console.log('\n📝 Manual steps:')
    console.log('1. Go to: https://supabase.com/dashboard/project/erkzlqgpbrxokyqtrgnf/sql/new')
    console.log('2. Copy content from: supabase/migrations/create_competitor_intelligence.sql')
    console.log('3. Paste and run in SQL Editor')
  }
}

applyMigration()
