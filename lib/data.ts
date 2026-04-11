// Data access layer for the directory. Applies the visibility rule centrally —
// no other module should re-implement it.
import { supabasePublic } from './supabase'
import { slugify } from './utils'
import type { DirectoryProfile } from './types'

type ProfileRow = {
  id: string
  business_name: string
  description: string | null
  category: string | null
  business_phone: string
  instagram_handle: string | null
  website_url: string | null
  other_socials: string | null
  directory_image_path: string | null
  offers_discount: boolean
  discount_details: string | null
  entrepreneurs: { full_name: string | null } | null
}

type GetProfilesOptions = {
  search?: string
  category?: string
  city?: string
}

export async function getProfiles(options: GetProfilesOptions = {}): Promise<DirectoryProfile[]> {
  let query = supabasePublic
    .from('business_profiles')
    .select(`
      id,
      business_name,
      description,
      category,
      business_phone,
      instagram_handle,
      website_url,
      other_socials,
      directory_image_path,
      offers_discount,
      discount_details,
      entrepreneurs ( full_name ),
      memberships!inner ( status, end_at ),
      profile_reviews!inner ( status )
    `)
    .eq('memberships.status', 'active')
    .eq('profile_reviews.status', 'aprobada')
    .gt('memberships.end_at', new Date().toISOString())

  if (options.search) {
    query = query.or(
      `business_name.ilike.%${options.search}%,description.ilike.%${options.search}%`
    )
  }

  if (options.category) {
    query = query.eq('category', options.category)
  }

  if (options.city) {
    query = query.eq('city', options.city)
  }

  const { data, error } = await query

  if (error) throw error
  if (!data || data.length === 0) return []

  return (data as unknown as ProfileRow[]).map((row) => ({
    id: row.id,
    business_name: row.business_name,
    description: row.description,
    category: row.category,
    business_phone: row.business_phone,
    instagram_handle: row.instagram_handle,
    website_url: row.website_url,
    other_socials: row.other_socials,
    directory_image_path: row.directory_image_path,
    offers_discount: row.offers_discount,
    discount_details: row.discount_details,
    full_name: row.entrepreneurs?.full_name ?? null,
    slug: slugify(row.business_name),
    is_verified: true,
  }))
}

export async function getProfileBySlug(slug: string): Promise<DirectoryProfile | null> {
  const profiles = await getProfiles()
  return profiles.find((p) => p.slug === slug) ?? null
}
