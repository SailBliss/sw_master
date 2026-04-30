import { checkDuplicate, getProduct, createAll } from '../repository/enrollment.repository'
import { uploadReceipt, uploadPostScreenshot } from '@src/shared/lib/storage'
import { notifyAdminNewApplication } from '@src/shared/lib/email'
import { getReview, markUsed } from '@src/features/profile-editorial-review/repository'
import type { SubmissionResult } from '../types'
import type { ApplicationEditorialStatus } from '@src/features/profile-editorial-review/types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type EnrollmentInput = {
  cedula: string
  full_name: string
  email: string
  phone: string
  fb_profile_url: string
  business_name: string
  description: string
  category: string
  business_phone: string
  instagram_handle: string | null
  website_url: string | null
  other_socials: string | null
  offers_discount: boolean
  discount_details: string | null
  product_id: string
  receipt: File | null
  post_screenshot: File | null
  description_editorial_status?: string
  description_review_id?: string
}

export const enrollmentService = {
  async submit(input: EnrollmentInput): Promise<SubmissionResult> {
    const isDuplicate = await checkDuplicate(input.cedula)
    if (isDuplicate) {
      return {
        success: false,
        message: 'Ya existe una solicitud con esta cédula. Si crees que es un error, contáctanos.',
      }
    }

    const product = await getProduct(input.product_id)
    if (!product) {
      return { success: false, message: 'El plan seleccionado no es válido.' }
    }

    const isPaidPlan = product.price_cop > 0
    if (isPaidPlan && (!input.receipt || input.receipt.size === 0)) {
      return { success: false, message: 'El comprobante de pago es obligatorio para este plan.' }
    }

    const entrepreneurId = crypto.randomUUID()

    let receiptPath = ''
    if (isPaidPlan && input.receipt) {
      receiptPath = await uploadReceipt(input.receipt, entrepreneurId)
    }

    let postScreenshotPath: string | null = null
    if (input.post_screenshot && input.post_screenshot.size > 0) {
      try {
        postScreenshotPath = await uploadPostScreenshot(input.post_screenshot, entrepreneurId)
      } catch {
        // No es obligatorio — continuamos sin ella
      }
    }

    // ─── Verify editorial review fields ─────────────────────────────────────────

    let editorialStatus: ApplicationEditorialStatus = 'requiere_revision_manual'
    let verifiedReviewId: string | null = null

    const rawStatus = input.description_editorial_status ?? ''
    const rawReviewId = input.description_review_id ?? ''

    if (UUID_REGEX.test(rawReviewId)) {
      try {
        const review = await getReview(rawReviewId)
        if (review) {
          verifiedReviewId = rawReviewId
          // Only elevate status when reviewId is verified server-side
          editorialStatus = rawStatus === 'ia_aceptada' ? 'ia_aceptada' : 'ia_sugerida'
        }
        // review not found → stays requiere_revision_manual, verifiedReviewId stays null
      } catch {
        // getReview failure → stays requiere_revision_manual
      }
    }
    // UUID invalid or absent → stays requiere_revision_manual

    const descriptionReviewed = editorialStatus !== 'requiere_revision_manual'

    const applicationId = await createAll({
      entrepreneurId,
      cedula: input.cedula,
      full_name: input.full_name,
      email: input.email,
      phone: input.phone,
      fb_profile_url: input.fb_profile_url,
      business_name: input.business_name,
      description: input.description,
      category: input.category,
      business_phone: input.business_phone,
      instagram_handle: input.instagram_handle,
      website_url: input.website_url,
      other_socials: input.other_socials,
      offers_discount: input.offers_discount,
      discount_details: input.discount_details,
      product_id: input.product_id,
      amount_cop: product.price_cop,
      receipt_path: receiptPath,
      post_screenshot_path: postScreenshotPath,
      description_editorial_status: editorialStatus,
      description_review_id: verifiedReviewId,
      description_reviewed: descriptionReviewed,
    })

    if (editorialStatus === 'ia_aceptada' && verifiedReviewId) {
      try {
        await markUsed(verifiedReviewId)
      } catch {
        // markUsed failure is non-blocking
      }
    }

    try {
      await notifyAdminNewApplication({
        entrepreneurName: input.full_name,
        businessName: input.business_name,
        category: input.category,
      })
    } catch {
      // El email falla silenciosamente — la solicitud ya está guardada
    }

    return {
      success: true,
      message: '¡Tu solicitud fue enviada! Revisaremos tu información y te contactaremos pronto.',
      applicationId,
    }
  },
}
