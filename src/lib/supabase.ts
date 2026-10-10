import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  key: string
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('nyayadesk_supabase_url') || '' : ''
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('nyayadesk_supabase_key') || '' : ''

  return {
    url: localUrl || envUrl,
    key: localKey || envKey,
  }
}

let clientInstance: SupabaseClient | null = null

export function initSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig()
  if (url && key && url.startsWith('http')) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
      return clientInstance
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e)
      clientInstance = null
      return null
    }
  }
  clientInstance = null
  return null
}

export function setSupabaseConfig(url: string, key: string): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('nyayadesk_supabase_url', url.trim())
    else localStorage.removeItem('nyayadesk_supabase_url')

    if (key) localStorage.setItem('nyayadesk_supabase_key', key.trim())
    else localStorage.removeItem('nyayadesk_supabase_key')
  }
  return initSupabase()
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig()
  return Boolean(url && key && url.startsWith('http'))
}

// Initial initialization
initSupabase()

export function getSupabase(): SupabaseClient | null {
  if (!clientInstance) {
    initSupabase()
  }
  return clientInstance
}
