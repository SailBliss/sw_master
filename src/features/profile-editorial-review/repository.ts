import { supabaseAdmin } from '@src/shared/lib/supabase-admin'
import type { ReviewRecord } from './types'

export async function countRecentReviews(sessionKey: string): Promise<number> {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const { count, error } = await supabaseAdmin
    .from('profile_description_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('session_key', sessionKey)
    .gte('created_at', since)

  if (error) throw new Error(`Error counting reviews: ${error.message}`)
  return count ?? 0
}

export async function saveReview(params: {
  sessionKey: string
  originalText: string
  suggestedText: string
  suggestedTags: string[]
}): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('profile_description_reviews')
    .insert({
      session_key: params.sessionKey,
      original_text: params.originalText,
      suggested_text: params.suggestedText,
      suggested_tags: params.suggestedTags,
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(`Error saving review: ${error?.message}`)
  return data.id as string
}

export async function getReview(reviewId: string): Promise<ReviewRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('profile_description_reviews')
    .select('*')
    .eq('id', reviewId)
    .maybeSingle()

  if (error) throw new Error(`Error fetching review: ${error.message}`)
  if (!data) return null

  return {
    id: data.id as string,
    sessionKey: data.session_key as string,
    originalText: data.original_text as string,
    suggestedText: data.suggested_text as string | null,
    suggestedTags: (data.suggested_tags as string[]) ?? [],
    accepted: data.accepted as boolean,
    createdAt: data.created_at as string,
    expiresAt: data.expires_at as string,
  }
}

export async function markUsed(reviewId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profile_description_reviews')
    .update({ accepted: true })
    .eq('id', reviewId)

  if (error) throw new Error(`Error marking review used: ${error.message}`)
}
