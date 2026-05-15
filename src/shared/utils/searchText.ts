export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function getLevenshteinDistance(left: string, right: string): number {
  const a = normalizeSearchText(left)
  const b = normalizeSearchText(right)

  if (a === b) return 0
  if (!a) return b.length
  if (!b) return a.length

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  const current = Array.from({ length: b.length + 1 }, () => 0)

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i

    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitutionCost
      )
    }

    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j]
    }
  }

  return previous[b.length]
}

export function isCloseSearchMatch(query: string, candidate: string): boolean {
  const normalizedQuery = normalizeSearchText(query)
  const normalizedCandidate = normalizeSearchText(candidate)

  if (!normalizedQuery || !normalizedCandidate) return false
  if (normalizedCandidate.includes(normalizedQuery)) return true
  if (normalizedQuery.includes(normalizedCandidate) && normalizedCandidate.length >= 4) return true

  const distance = getLevenshteinDistance(normalizedQuery, normalizedCandidate)
  const maxDistance = normalizedQuery.length <= 6 ? 1 : 2

  return distance <= maxDistance
}
