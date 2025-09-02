// Test Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase connection...');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    console.log('🔄 Testing connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('✅ Connection successful!');
        console.log('❌ Table "profiles" does not exist yet');
        console.log('💡 You need to run the schema.sql in your Supabase Dashboard');
      } else {
        console.log('❌ Connection error:', error.message);
      }
    } else {
      console.log('✅ Connection successful and table exists!');
      console.log('📊 Data:', data);
    }
    
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    console.log('💡 Check your internet connection and Supabase URL');
  }
}

testConnection();
