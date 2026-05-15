const STORAGE_KEY = 'sw_recent_searches'
const MAX_RECENT_SEARCHES = 8

export function readRecentSearches(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  } catch {
    return []
  }
}

export function writeRecentSearch(query: string): string[] {
  const trimmed = query.trim()
  if (!trimmed || typeof window === 'undefined') return readRecentSearches()

  const normalized = trimmed.toLowerCase()
  const next = [
    trimmed,
    ...readRecentSearches().filter((item) => item.toLowerCase() !== normalized),
  ].slice(0, MAX_RECENT_SEARCHES)

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function removeRecentSearch(query: string): string[] {
  if (typeof window === 'undefined') return []

  const normalized = query.trim().toLowerCase()
  const next = readRecentSearches().filter((item) => item.toLowerCase() !== normalized)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function clearRecentSearches(): string[] {
  if (typeof window === 'undefined') return []

  window.localStorage.removeItem(STORAGE_KEY)
  return []
}
