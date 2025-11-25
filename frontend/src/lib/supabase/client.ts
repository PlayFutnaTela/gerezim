import { createBrowserClient } from '@supabase/ssr'

export function createClient(initialSession?: any) {
  // Accept an optional initialSession so server-derived session can be passed into
  // the browser client. This ensures the client has an authenticated session
  // when the page is server-rendered and then hydrates on the client.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      initialSession,
      cookies: {
        get(name: string) {
          return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1] || ''
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; path=/; max-age=${options?.maxAge || 31536000}; secure; samesite=lax`
        },
        remove(name: string) {
          document.cookie = `${name}=; path=/; max-age=0`
        },
      },
    }
  )
}
