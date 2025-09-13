import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wybsjurcgoqguzzddhrj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || ''

if (!supabaseKey) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase