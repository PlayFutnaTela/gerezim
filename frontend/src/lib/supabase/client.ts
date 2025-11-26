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
          const match = document.cookie.split('; ').find(row => row.startsWith(name + '='))
          const value = match ? match.split('=').slice(1).join('=') : null
          const decoded = value ? decodeURIComponent(value) : null
          // debug help in development
          if (process.env.NODE_ENV !== 'production') {
            console.debug('supabase: cookie.get', { name, value: decoded })
          }
          return decoded
        },
        set(name: string, value: string, options: any) {
          // Only add `Secure` attribute when connection is actually secure (https) or in production
          const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
          const maxAge = options?.maxAge ?? 31536000
          // Build cookie string components
          const parts = [`${name}=${value}`, `path=/`, `max-age=${maxAge}`, `samesite=lax`]
          if (isSecure || process.env.NODE_ENV === 'production') parts.push('secure')
          const cookieString = parts.join('; ')
          if (process.env.NODE_ENV !== 'production') console.debug('supabase: cookie.set', { name, value, options, cookieString })
          document.cookie = cookieString
        },
        remove(name: string) {
          // expire the cookie
          if (process.env.NODE_ENV !== 'production') console.debug('supabase: cookie.remove', { name })
          document.cookie = `${name}=; path=/; max-age=0`
        },
      },
    }
  )
}
