// Helper utilities to work with user roles stored in public.profiles.role
import type { Database } from '@/types/supabase'

export type ProfileRow = Database['public']['Tables']['profiles']['Row']

export function isAdmin(profile?: Partial<ProfileRow> | null) {
  return !!(profile && profile.role === 'adm')
}

export function isUser(profile?: Partial<ProfileRow> | null) {
  return !!(profile && profile.role === 'user')
}

export default { isAdmin, isUser }
