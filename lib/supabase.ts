import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging to catch configuration issues
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl?.substring(0, 20) + '...')
  console.log('Supabase Key:', supabaseAnonKey?.substring(0, 20) + '...')
}

if (!supabaseUrl) {
  console.warn("NEXT_PUBLIC_SUPABASE_URL is not set. Some features may not work.")
}

if (!supabaseAnonKey) {
  console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Some features may not work.")
}

// Validate URL format before creating client
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return url.startsWith('https://') && url.includes('.supabase.co')
  } catch {
    return false
  }
}

if (supabaseUrl && !isValidUrl(supabaseUrl)) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
}

// Create a default client even if env vars are missing (for development)
export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl! : "https://placeholder.supabase.co",
  supabaseAnonKey && supabaseAnonKey.startsWith('eyJ') ? supabaseAnonKey : "placeholder-key",
)

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://placeholder.supabase.co" &&
    supabaseAnonKey !== "placeholder-key"
  )
}

// Helper function to create a client with error handling
export const createSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not properly configured. Using mock client.")
    return null
  }
  return supabase
}
