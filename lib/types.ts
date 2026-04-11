// Represents a business profile as returned by the directory API — ready to render, visibility rule already applied.
export type DirectoryProfile = {
  // From business_profiles
  id: string;
  business_name: string;
  description: string | null;
  category: string | null;
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
