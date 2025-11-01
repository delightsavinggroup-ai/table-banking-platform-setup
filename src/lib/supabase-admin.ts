
import { createClient } from '@supabase/supabase-js';

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  `https://koytnolisjrmxqewdjhn.supabase.co`,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);