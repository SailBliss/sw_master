import type { DirectoryProfile } from '@src/features/profiles/types'
import { isCloseSearchMatch, normalizeSearchText } from '@src/shared/utils/searchText'
import { getAllSearchTerms, getSynonymSuggestion } from './searchSynonyms'

export type SearchSuggestionKind = 'category' | 'business' | 'city' | 'term' | 'synonym'

export type SearchSuggestion = {
  label: string
  kind: SearchSuggestionKind
}

export type SearchSuggestionSource = {
  categories: string[]
  businessNames: string[]
  cities: string[]
  descriptionTerms: string[]
}

const DESCRIPTION_TERMS = [
  'abogada',
  'asesoría',
  'belleza',
  'cejas',
  'comida',
  'decoración',
  'diseño de interiores',
  'estética',
  'hogar',
  'joyería',
  'limpieza',
  'maquillaje',
  'médica estética',
  'nutricionista',
  'psicóloga',
  'remodelación',
  'salud mental',
  'terapia',
  'tortas',
  'uñas',
]

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed) continue

    const normalized = normalizeSearchText(trimmed)
    if (seen.has(normalized)) continue

    seen.add(normalized)
    result.push(trimmed)
  }

  return result.sort((left, right) => left.localeCompare(right, 'es'))
}

export function buildSearchSuggestionSource(profiles: DirectoryProfile[]): SearchSuggestionSource {
  const descriptions = profiles.map((profile) => profile.description ?? '').join(' ')
  const descriptionTerms = DESCRIPTION_TERMS.filter((term) =>
    normalizeSearchText(descriptions).includes(normalizeSearchText(term))
  )

  return {
    categories: uniqueSorted(profiles.map((profile) => profile.category)),
    businessNames: uniqueSorted(profiles.map((profile) => profile.business_name)),
    cities: uniqueSorted(profiles.map((profile) => profile.city)),
    descriptionTerms: uniqueSorted([...descriptionTerms, ...getAllSearchTerms()]),
  }
}

export function getSearchSuggestions(query: string, source: SearchSuggestionSource): SearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query)
  const results: SearchSuggestion[] = []
  const seen = new Set<string>()

  function add(label: string, kind: SearchSuggestionKind) {
    const normalized = normalizeSearchText(label)
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    results.push({ label, kind })
  }

  if (!normalizedQuery) return []

  const synonym = getSynonymSuggestion(query)
  if (synonym) add(synonym, 'synonym')

  for (const category of source.categories) {
    if (isCloseSearchMatch(query, category)) add(category, 'category')
  }

  for (const businessName of source.businessNames) {
    if (isCloseSearchMatch(query, businessName)) add(businessName, 'business')
  }

  for (const city of source.cities) {
    if (isCloseSearchMatch(query, city)) add(city, 'city')
  }

  for (const term of source.descriptionTerms) {
    if (isCloseSearchMatch(query, term)) add(term, 'term')
  }

  return results.slice(0, 8)
}
