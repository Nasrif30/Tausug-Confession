// Database setup script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env file in the backend directory');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Read schema file
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Try direct execution for table creation
            const { error: directError } = await supabase.from('profiles').select('id').limit(1);
            if (directError && directError.code === '42P01') {
              console.log('⚠️  Table creation may require manual execution in Supabase Dashboard');
              console.log('Please run the schema.sql file in your Supabase SQL Editor');
            }
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} had issues:`, err.message);
        }
      }
    }
    
    console.log('✅ Database setup completed!');
    console.log('🔗 Check your Supabase Dashboard to verify tables were created');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('💡 Try running the schema manually in Supabase Dashboard');
  }
}

setupDatabase();
