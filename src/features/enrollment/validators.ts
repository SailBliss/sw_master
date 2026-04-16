import { z } from 'zod'

export const step1Schema = z.object({
  cedula: z.string().min(6, 'Cédula inválida').max(12),
  full_name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono inválido'),
  fb_profile_url: z.string().url('URL de perfil de Facebook inválida'),
})

export const step2Schema = z.object({
  business_name: z.string().min(2, 'Nombre del negocio requerido'),
  description: z.string().min(10, 'Descripción muy corta'),
  category: z.string().min(1, 'Categoría requerida'),
  business_phone: z.string().min(7, 'Teléfono del negocio inválido'),
  instagram_handle: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  other_socials: z.string().optional(),
  offers_discount: z.boolean(),
  discount_details: z.string().optional(),
})

export const step3Schema = z.object({
  product_id: z.string().uuid('Plan inválido'),
  consent_accepted: z.literal(true, {
    error: () => ({ message: 'Debes aceptar los términos para continuar.' }),
  }),
})

export const fullFormSchema = step1Schema.merge(step2Schema).merge(step3Schema)
