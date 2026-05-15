import type { DirectoryProfile } from '@src/features/profiles/types'
import {
  buildDirectorySearchIndex,
  type DirectorySearchIndexEntry,
  type DirectorySearchSuggestionKind,
} from '@src/features/profiles/search/directory-search-intelligence'
import { isCloseSearchMatch, normalizeSearchText } from '@src/shared/utils/searchText'
import { getAllSearchTerms, getSynonymSuggestion } from './searchSynonyms'

export type SearchSuggestionKind = DirectorySearchSuggestionKind

export type SearchSuggestion = {
  label: string
  kind: SearchSuggestionKind
}

export type SearchSuggestionSource = {
  suggestions: DirectorySearchIndexEntry[]
}

const MAX_VISIBLE_SUGGESTIONS = 6
const SYNONYM_WEIGHT = 8
const CONNECTED_SYNONYM_WEIGHT = 14

export function buildSearchSuggestionSource(profiles: DirectoryProfile[]): SearchSuggestionSource {
  const profileSuggestions = buildDirectorySearchIndex(profiles)
  const generatedLabels = new Set(profileSuggestions.map((suggestion) => suggestion.normalizedLabel))
  const suggestions = new Map<string, DirectorySearchIndexEntry>()

  for (const suggestion of profileSuggestions) {
    mergeSuggestion(suggestions, suggestion)
  }

  for (const term of getAllSearchTerms()) {
    const normalizedLabel = normalizeSearchText(term)
    if (!normalizedLabel) continue

    const isConnected = Array.from(generatedLabels).some((generatedLabel) =>
      generatedLabel.includes(normalizedLabel) || normalizedLabel.includes(generatedLabel)
    )

    mergeSuggestion(suggestions, {
      label: term,
      normalizedLabel,
      kind: 'synonym',
      weight: isConnected ? CONNECTED_SYNONYM_WEIGHT : SYNONYM_WEIGHT,
    })
  }

  return {
    suggestions: Array.from(suggestions.values()).sort(compareSourceSuggestions),
  }
}

export function getSearchSuggestions(query: string, source: SearchSuggestionSource): SearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  const scored = new Map<string, DirectorySearchIndexEntry & { score: number }>()
  const synonym = getSynonymSuggestion(query)

  if (synonym) {
    const normalizedLabel = normalizeSearchText(synonym)
    scored.set(normalizedLabel, {
      label: synonym,
      normalizedLabel,
      kind: 'synonym',
      weight: CONNECTED_SYNONYM_WEIGHT,
      score: getSuggestionScore(normalizedQuery, normalizedLabel, 'synonym', CONNECTED_SYNONYM_WEIGHT),
    })
  }

  for (const suggestion of source.suggestions) {
    if (!isCloseSearchMatch(query, suggestion.label)) continue

    const score = getSuggestionScore(
      normalizedQuery,
      suggestion.normalizedLabel,
      suggestion.kind,
      suggestion.weight
    )
    const current = scored.get(suggestion.normalizedLabel)

    if (!current || score > current.score) {
      scored.set(suggestion.normalizedLabel, { ...suggestion, score })
    }
  }

  return Array.from(scored.values())
    .sort((left, right) => {
      const scoreDifference = right.score - left.score
      if (scoreDifference !== 0) return scoreDifference

      return left.label.localeCompare(right.label, 'es')
    })
    .slice(0, MAX_VISIBLE_SUGGESTIONS)
    .map(({ label, kind }) => ({ label, kind }))
}

function mergeSuggestion(
  suggestions: Map<string, DirectorySearchIndexEntry>,
  suggestion: DirectorySearchIndexEntry
) {
  const current = suggestions.get(suggestion.normalizedLabel)

  if (!current) {
    suggestions.set(suggestion.normalizedLabel, suggestion)
    return
  }

  current.weight += suggestion.weight
}

function getSuggestionScore(
  normalizedQuery: string,
  normalizedLabel: string,
  kind: SearchSuggestionKind,
  weight: number
): number {
  const exactScore = normalizedLabel === normalizedQuery ? 1000 : 0
  const prefixScore = normalizedLabel.startsWith(normalizedQuery) ? 500 : 0
  const containsScore = normalizedLabel.includes(normalizedQuery) ? 150 : 0

  return exactScore + prefixScore + containsScore + getKindScore(kind) + weight
}

function getKindScore(kind: SearchSuggestionKind): number {
  if (kind === 'category') return 90
  if (kind === 'business') return 80
  if (kind === 'phrase') return 55
  if (kind === 'synonym') return 45
  if (kind === 'keyword') return 25
  return 20
}

function compareSourceSuggestions(left: DirectorySearchIndexEntry, right: DirectorySearchIndexEntry): number {
  const kindDifference = getKindScore(right.kind) - getKindScore(left.kind)
  if (kindDifference !== 0) return kindDifference

  const weightDifference = right.weight - left.weight
  if (weightDifference !== 0) return weightDifference

  return left.label.localeCompare(right.label, 'es')
}
