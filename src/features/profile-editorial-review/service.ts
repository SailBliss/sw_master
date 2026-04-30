import { callGeminiReview } from './provider'
import { countRecentReviews, saveReview } from './repository'
import type { ReviewRequest, ReviewResult } from './types'

const MAX_REVIEWS_PER_SESSION = 3

type ServiceResult =
  | { ok: true; data: ReviewResult }
  | { ok: false; status: 429 | 500; message: string }

export async function requestReview(input: ReviewRequest): Promise<ServiceResult> {
  const count = await countRecentReviews(input.sessionKey)
  if (count >= MAX_REVIEWS_PER_SESSION) {
    return {
      ok: false,
      status: 429,
      message: 'Alcanzaste el máximo de 3 revisiones. Puedes continuar con tu descripción actual.',
    }
  }

  let geminiResult: { suggestedText: string; suggestedTags: string[] }
  try {
    geminiResult = await callGeminiReview(input.description)
  } catch (err) {
    console.error('[editorial-review] Gemini error:', err)
    return {
      ok: false,
      status: 500,
      message: 'El servicio de revisión no está disponible en este momento. Puedes continuar sin revisión.',
    }
  }

  const reviewId = await saveReview({
    sessionKey: input.sessionKey,
    originalText: input.description,
    suggestedText: geminiResult.suggestedText,
    suggestedTags: geminiResult.suggestedTags,
  })

  return {
    ok: true,
    data: {
      reviewId,
      suggestedText: geminiResult.suggestedText,
      suggestedTags: geminiResult.suggestedTags,
    },
  }
}
