// server/src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Only throw error in production
if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseServiceKey || supabaseUrl === 'https://placeholder.supabase.co')) {
  throw new Error('Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Server-side client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: fetch
  }
});

// Client-side configuration for frontend
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.SUPABASE_ANON_KEY) {
  console.warn('Warning: SUPABASE_ANON_KEY not found. This is needed for client-side operations.');
}

const createClientSideConfig = () => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey
});

module.exports = {
  supabase,
  createClientSideConfig,
  supabaseUrl,
  supabaseAnonKey
};