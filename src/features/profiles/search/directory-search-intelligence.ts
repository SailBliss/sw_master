import type { DirectoryProfile } from '@src/features/profiles/types'
import { normalizeSearchText } from '@src/shared/utils/searchText'

export type DirectorySearchSuggestionKind = 'category' | 'business' | 'city' | 'phrase' | 'keyword' | 'synonym'

export type DirectorySearchIndexEntry = {
  label: string
  normalizedLabel: string
  kind: DirectorySearchSuggestionKind
  weight: number
}

type KeywordCandidate = {
  label: string
  kind: DirectorySearchSuggestionKind
  weight: number
}

const STOPWORDS = new Set([
  'de',
  'la',
  'el',
  'los',
  'las',
  'para',
  'con',
  'por',
  'en',
  'un',
  'una',
  'y',
  'o',
  'del',
  'al',
])

const GENERIC_WORDS = new Set([
  'alta',
  'calidad',
  'cliente',
  'clientes',
  'emprendimiento',
  'empresa',
  'experiencia',
  'mejor',
  'mejores',
  'negocio',
  'personalizado',
  'personalizados',
  'producto',
  'productos',
  'profesional',
  'profesionales',
  'servicio',
  'servicios',
  'solucion',
  'soluciones',
  'ubicada',
  'ubicado',
])

const BLOCKED_PHRASE_PREFIXES = [
  'calidad en',
  'productos de',
  'servicio para',
  'servicios para',
  'ubicada en',
  'ubicado en',
]

const MAX_GENERATED_TERMS = 150
const CATEGORY_WEIGHT = 24
const BUSINESS_WEIGHT = 22
const CITY_WEIGHT = 10
const PHRASE_WEIGHT = 8
const KEYWORD_WEIGHT = 3

export function tokenizeSearchText(text: string): string[] {
  return normalizeSearchText(text)
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
}

export function extractKeywordCandidates(profile: DirectoryProfile): DirectorySearchIndexEntry[] {
  const candidates: KeywordCandidate[] = []

  addCandidate(candidates, profile.category, 'category', CATEGORY_WEIGHT)
  addCandidate(candidates, profile.business_name, 'business', BUSINESS_WEIGHT)
  addCandidate(candidates, profile.city, 'city', CITY_WEIGHT)

  const searchableText = [
    profile.description,
    profile.category,
    profile.discount_details,
  ].filter((value): value is string => Boolean(value?.trim())).join(' ')

  for (const keyword of extractKeywords(searchableText)) {
    addCandidate(candidates, keyword, 'keyword', KEYWORD_WEIGHT)
  }

  for (const phrase of extractPhrases(searchableText)) {
    addCandidate(candidates, phrase, 'phrase', PHRASE_WEIGHT)
  }

  return mergeCandidates(candidates)
}

export function buildDirectorySearchIndex(profiles: DirectoryProfile[]): DirectorySearchIndexEntry[] {
  const preserved: DirectorySearchIndexEntry[] = []
  const generated = new Map<string, DirectorySearchIndexEntry>()

  for (const profile of profiles) {
    for (const candidate of extractKeywordCandidates(profile)) {
      if (candidate.kind === 'keyword' || candidate.kind === 'phrase') {
        mergeEntry(generated, candidate)
      } else {
        preserved.push(candidate)
      }
    }
  }

  const limitedGenerated = Array.from(generated.values())
    .sort(compareIndexEntries)
    .slice(0, MAX_GENERATED_TERMS)

  return mergeCandidates([...preserved, ...limitedGenerated]).sort(compareIndexEntries)
}

function extractKeywords(text: string): string[] {
  const seen = new Set<string>()
  const keywords: string[] = []

  for (const token of tokenizeSearchText(text)) {
    if (GENERIC_WORDS.has(token) || seen.has(token)) continue
    seen.add(token)
    keywords.push(token)
  }

  return keywords
}

function extractPhrases(text: string): string[] {
  const words = normalizeSearchText(text)
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean)
  const phrases = new Set<string>()

  for (const size of [2, 3]) {
    for (let index = 0; index <= words.length - size; index += 1) {
      const slice = words.slice(index, index + size)
      const phrase = slice.join(' ')

      if (!isUsefulPhrase(slice, phrase)) continue
      phrases.add(phrase)
    }
  }

  return Array.from(phrases)
}

function isUsefulPhrase(words: string[], phrase: string): boolean {
  if (BLOCKED_PHRASE_PREFIXES.some((prefix) => phrase.startsWith(prefix))) return false

  const contentWords = words.filter((word) => !STOPWORDS.has(word))
  if (contentWords.length < 2) return false
  if (contentWords.some((word) => word.length < 4)) return false
  if (contentWords.every((word) => GENERIC_WORDS.has(word))) return false
  if (GENERIC_WORDS.has(contentWords[0]) || GENERIC_WORDS.has(contentWords[contentWords.length - 1])) return false

  return true
}

function addCandidate(
  candidates: KeywordCandidate[],
  label: string | null | undefined,
  kind: DirectorySearchSuggestionKind,
  weight: number
) {
  const trimmed = label?.trim()
  if (!trimmed) return

  const normalizedLabel = normalizeSearchText(trimmed)
  if (!normalizedLabel) return

  candidates.push({ label: trimmed, kind, weight })
}

function mergeCandidates(candidates: KeywordCandidate[]): DirectorySearchIndexEntry[]
function mergeCandidates(candidates: DirectorySearchIndexEntry[]): DirectorySearchIndexEntry[]
function mergeCandidates(candidates: Array<KeywordCandidate | DirectorySearchIndexEntry>): DirectorySearchIndexEntry[] {
  const merged = new Map<string, DirectorySearchIndexEntry>()

  for (const candidate of candidates) {
    const normalizedLabel = 'normalizedLabel' in candidate
      ? candidate.normalizedLabel
      : normalizeSearchText(candidate.label)

    if (!normalizedLabel) continue
    mergeEntry(merged, { ...candidate, normalizedLabel })
  }

  return Array.from(merged.values())
}

function mergeEntry(entries: Map<string, DirectorySearchIndexEntry>, candidate: DirectorySearchIndexEntry) {
  const current = entries.get(candidate.normalizedLabel)

  if (!current) {
    entries.set(candidate.normalizedLabel, candidate)
    return
  }

  current.weight += candidate.weight
}

function compareIndexEntries(left: DirectorySearchIndexEntry, right: DirectorySearchIndexEntry): number {
  const weightDifference = right.weight - left.weight
  if (weightDifference !== 0) return weightDifference

  const kindDifference = getKindPriority(right.kind) - getKindPriority(left.kind)
  if (kindDifference !== 0) return kindDifference

  return left.label.localeCompare(right.label, 'es')
}

function getKindPriority(kind: DirectorySearchSuggestionKind): number {
  if (kind === 'category') return 5
  if (kind === 'business') return 4
  if (kind === 'phrase') return 3
  if (kind === 'synonym') return 2
  if (kind === 'city') return 1
  return 0
}
