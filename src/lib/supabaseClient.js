import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are configured
const hasValidKeys = supabaseUrl && 
                     supabaseAnonKey && 
                     supabaseUrl.includes('supabase.co');

if (!hasValidKeys) {
  console.error(`
═══════════════════════════════════════════════════════════
⚠️  SUPABASE CONFIGURATION NEEDED
═══════════════════════════════════════════════════════════

Please add your Supabase keys:

1. Create .env file in project root (if not exists):
   ${supabaseUrl ? '   ✅ .env file exists' : '   ❌ .env file missing or empty'}

2. Add these variables to .env:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

3. Get your keys from:
   → https://app.supabase.com
   → Settings → API
   → Copy "Project URL" and "anon public" key

4. Restart dev server after adding keys:
   Ctrl+C to stop, then: npm run dev

Current values:
   VITE_SUPABASE_URL: ${supabaseUrl || 'NOT SET'}
   VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET (but invalid)' : 'NOT SET'}

═══════════════════════════════════════════════════════════
  `);
}


export const supabase = hasValidKeys ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const isSupabaseConfigured = hasValidKeys;
