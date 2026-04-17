import { supabaseAdmin } from '@src/shared/lib/supabase-admin'
import type { ContactClickType, ProfileStats } from '../types'

export async function insertView(profileId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profile_views')
    .insert({ profile_id: profileId, viewed_at: new Date().toISOString() })

  if (error) throw new Error(`Error al registrar vista: ${error.message}`)
}

export async function insertClick(profileId: string, type: ContactClickType): Promise<void> {
  const { error } = await supabaseAdmin
    .from('contact_clicks')
    .insert({ profile_id: profileId, click_type: type, clicked_at: new Date().toISOString() })

  if (error) throw new Error(`Error al registrar click: ${error.message}`)
}

export async function getStatsByToken(token: string): Promise<ProfileStats | null> {
  // Buscar el perfil asociado al token
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('business_profiles')
    .select('id')
    .eq('stats_token', token)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)
  if (!profile) return null

  const profileId = profile.id as string

  const { count: views } = await supabaseAdmin
    .from('profile_views')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)

  const { data: clicks } = await supabaseAdmin
    .from('contact_clicks')
    .select('click_type')
    .eq('profile_id', profileId)

  const clickCounts = { whatsapp: 0, instagram: 0, website: 0 }
  for (const c of clicks ?? []) {
    const t = c.click_type as ContactClickType
    if (t in clickCounts) clickCounts[t]++
  }

  return {
    profileId,
    views: views ?? 0,
    clicks: {
      ...clickCounts,
      total: clickCounts.whatsapp + clickCounts.instagram + clickCounts.website,
    },
  }
}
