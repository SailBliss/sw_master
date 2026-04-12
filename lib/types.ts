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
