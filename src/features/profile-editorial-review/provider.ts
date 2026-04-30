type GeminiReviewResponse = {
  suggestedText: string
  suggestedTags: string[]
}

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export async function callGeminiReview(description: string): Promise<GeminiReviewResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const prompt = `Eres un editor de texto especializado en negocios latinoamericanos.
Recibiste la siguiente descripción de un emprendimiento escrita por su dueña:

"""
${description}
"""

Tu tarea:
1. Reescribe la descripción en 1-3 oraciones cortas. Mantén el tono cálido y auténtico. No uses jerga corporativa. Máximo 280 caracteres.
2. Sugiere entre 2 y 5 etiquetas (tags) cortas en español que describan el negocio. Cada tag: 1-3 palabras, sin #.

Responde ÚNICAMENTE con JSON válido en este formato exacto, sin texto adicional:
{
  "suggestedText": "...",
  "suggestedTags": ["...", "..."]
}`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${errorText}`)
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Gemini returned non-JSON response: ${rawText.slice(0, 200)}`)
  }

  const p = parsed as Record<string, unknown>
  const suggestedText = typeof p.suggestedText === 'string' ? p.suggestedText.slice(0, 300) : ''
  const suggestedTags = Array.isArray(p.suggestedTags)
    ? (p.suggestedTags as unknown[])
        .filter((t): t is string => typeof t === 'string')
        .slice(0, 5)
    : []

  if (!suggestedText) throw new Error('Gemini returned empty suggestedText')

  return { suggestedText, suggestedTags }
}
