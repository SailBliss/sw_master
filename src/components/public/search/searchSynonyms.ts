import { normalizeSearchText } from '@src/shared/utils/searchText'

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  'psicóloga': ['psicologa', 'sicologa', 'terapia', 'terapeuta', 'salud mental'],
  nutricionista: ['nutricion', 'nutricionsta', 'dieta', 'peso', 'alimentación', 'alimentacion'],
  abogada: ['abogado', 'legal', 'contratos', 'separación', 'separacion', 'familia'],
  decoración: ['decoracion', 'diseño de interiores', 'diseno de interiores', 'remodelación', 'remodelacion', 'hogar'],
  belleza: ['estética', 'estetica', 'cejas', 'uñas', 'unas', 'maquillaje'],
  comida: ['catering', 'tortas', 'pasteles', 'restaurante'],
  empleada: ['aseo', 'limpieza', 'doméstica', 'domestica', 'interna'],
  joyería: ['joyeria', 'accesorios', 'bisutería', 'bisuteria'],
  'médica estética': ['medica estetica', 'medicina estética', 'medicina estetica', 'estética médica', 'estetica medica'],
}

export function getSynonymSuggestion(query: string): string | null {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return null

  for (const [term, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
    const normalizedTerm = normalizeSearchText(term)
    if (normalizedTerm.includes(normalizedQuery) || normalizedQuery.includes(normalizedTerm)) {
      return term
    }

    if (synonyms.some((synonym) => normalizeSearchText(synonym).includes(normalizedQuery) || normalizedQuery.includes(normalizeSearchText(synonym)))) {
      return term
    }
  }

  return null
}

export function getAllSearchTerms(): string[] {
  return Object.entries(SEARCH_SYNONYMS).flatMap(([term, synonyms]) => [term, ...synonyms])
}
