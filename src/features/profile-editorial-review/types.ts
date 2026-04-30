export type ReviewRequest = {
  description: string
  sessionKey: string
}

export type ReviewResult = {
  reviewId: string
  suggestedText: string
  suggestedTags: string[]
}

export type ReviewRecord = {
  id: string
  sessionKey: string
  originalText: string
  suggestedText: string | null
  suggestedTags: string[]
  accepted: boolean
  createdAt: string
  expiresAt: string
}
