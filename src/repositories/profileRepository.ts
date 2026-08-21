import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile not found
      return null
    }
    throw error
  }

  return data as Profile
}

export async function upsertProfile(
  profile: Omit<Profile, 'created_at' | 'updated_at'>
): Promise<Profile> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        updated_at: now,
      } as never,
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Profile
}

export async function updateProfile(
  userId: string,
  data: Partial<Pick<Profile, 'display_name'>>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', userId)

  if (error) {
    throw error
  }
}
