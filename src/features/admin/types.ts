export type AdminApplication = {
  id: string
  status: 'pendiente' | 'aprobado' | 'rechazado'
  amount_cop: number
  submitted_at: string
  reviewed_at: string | null
  notes: string | null
  receipt_path: string
  post_screenshot_path: string | null
  entrepreneur: {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
    cedula: string
    fb_profile_url: string | null
  }
  business_profile: {
    id: string
    business_name: string | null
    category: string | null
    description: string | null
    business_phone: string | null
    instagram_handle: string | null
    website_url: string | null
    directory_image_path: string | null
    offers_discount: boolean
    discount_details: string | null
  }
  product: {
    id: string
    name: string
    price_cop: number
    duration_days: number | null
  }
}

export type AdminProfile = {
  entrepreneur_id: string
  cedula: string
  full_name: string | null
  email: string | null
  phone: string | null
  fb_profile_url: string | null
  business_name: string | null
  category: string | null
  description: string | null
  business_phone: string | null
  instagram_handle: string | null
  website_url: string | null
  other_socials: string | null
  directory_image_path: string | null
  offers_discount: boolean
  discount_details: string | null
  membership_status: 'active' | 'inactive' | null
  membership_start: string | null
  membership_end: string | null
  application_status: 'pendiente' | 'aprobado' | 'rechazado' | null
}

export type MembershipAlert = {
  entrepreneur_id: string
  full_name: string | null
  business_name: string | null
  membership_end: string
  days_remaining: number
}

export type UpdateProfileData = {
  full_name?: string
  email?: string
  phone?: string
  fb_profile_url?: string
  business_name?: string
  category?: string
  description?: string
  business_phone?: string
  instagram_handle?: string
  website_url?: string
  other_socials?: string
  directory_image_path?: string
  offers_discount?: boolean
  discount_details?: string
}
