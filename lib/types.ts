// Represents a business profile as returned by the directory API — ready to render, visibility rule already applied.
export type DirectoryProfile = {
  // From business_profiles
  id: string;
  business_name: string;
  description: string | null;
  category: string | null;
  city: string | null;
  business_phone: string;
  instagram_handle: string | null;
  website_url: string | null;
  other_socials: string | null;
  directory_image_path: string | null;
  offers_discount: boolean;
  discount_details: string | null;

  // From entrepreneurs
  full_name: string | null;

  // Computed in the data layer
  slug: string;
  is_verified: boolean;
};

// M2 — Formulario de inscripción

export type ApplicationFormStep1 = {
  cedula: string;
  full_name: string;
  email: string;
  phone: string;
  fb_profile_url: string;
};

export type ApplicationFormStep2 = {
  business_name: string;
  description: string;
  category: string;
  business_phone: string;
  instagram_handle?: string;
  website_url?: string;
  other_socials?: string;
  offers_discount: boolean;
  discount_details?: string;
  directory_image: File | null;
};

export type ApplicationFormStep3 = {
  product_id: string;
  receipt: File;
  post_screenshot: File | null;
  consent_accepted: boolean;
};

export type ApplicationFormData = ApplicationFormStep1 & ApplicationFormStep2 & ApplicationFormStep3;

export type ProductOption = {
  id: string;
  name: string;
  price_cop: number;
  duration_days: number | null;
};

export type SubmissionResult = {
  success: boolean;
  message: string;
  applicationId?: string;
};

// ---------------------------------------------------------------------------
// M3 — Panel de administración
// ---------------------------------------------------------------------------

// Solicitud completa para revisión en el panel. Resultado de un JOIN entre
// applications, entrepreneurs, business_profiles y products.
export type AdminApplication = {
  id: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  amount_cop: number;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
  receipt_path: string;
  post_screenshot_path: string | null;
  entrepreneur: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    cedula: string;
    fb_profile_url: string | null;
  };
  business_profile: {
    id: string;
    business_name: string | null;
    category: string | null;
    description: string | null;
    business_phone: string | null;
    instagram_handle: string | null;
    website_url: string | null;
    directory_image_path: string | null;
    offers_discount: boolean;
    discount_details: string | null;
  };
  product: {
    id: string;
    name: string;
    price_cop: number;
    duration_days: number | null;
  };
};

// Perfil completo para gestión administrativa. Agrega datos de entrepreneurs,
// business_profiles, memberships y applications en una sola vista.
export type AdminProfile = {
  entrepreneur_id: string;
  cedula: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  fb_profile_url: string | null;
  business_name: string | null;
  category: string | null;
  description: string | null;
  business_phone: string | null;
  instagram_handle: string | null;
  website_url: string | null;
  other_socials: string | null;
  directory_image_path: string | null;
  offers_discount: boolean;
  discount_details: string | null;
  membership_status: 'active' | 'inactive' | null;
  membership_start: string | null;
  membership_end: string | null;
  application_status: 'pendiente' | 'aprobado' | 'rechazado' | null;
};

// Membresía próxima a vencer o ya vencida. days_remaining es negativo si venció.
export type MembershipAlert = {
  entrepreneur_id: string;
  full_name: string | null;
  business_name: string | null;
  membership_end: string;
  days_remaining: number;
};
