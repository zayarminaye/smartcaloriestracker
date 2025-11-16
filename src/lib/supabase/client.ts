import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export a function that creates a new Supabase client
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

// For backwards compatibility, also export a default instance
export const supabase = createClient()
