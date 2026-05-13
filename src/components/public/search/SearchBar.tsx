'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CloseIcon, SearchIcon } from '@components/icons/ui'
import { normalizeSearchText } from '@src/shared/utils/searchText'
import { SmartSearchButton } from './SmartSearchButton'
import {
  clearRecentSearches,
  readRecentSearches,
  removeRecentSearch,
  writeRecentSearch,
} from './recentSearches'
import {
  getSearchSuggestions,
  type SearchSuggestionKind,
  type SearchSuggestionSource,
} from './searchSuggestions'

type SearchBarProps = {
  defaultValue?: string
  size?: 'icon' | 'hero' | 'inline'
  onClick?: () => void
  onSearchSubmit?: () => void
  expanded?: boolean
  resetOnCollapse?: boolean
  suggestionSource?: SearchSuggestionSource
}

const EMPTY_SUGGESTION_SOURCE: SearchSuggestionSource = {
  suggestions: [],
}

export function SearchBar({
  defaultValue,
  size = 'icon',
  onClick,
  onSearchSubmit,
  expanded,
  resetOnCollapse = false,
  suggestionSource = EMPTY_SUGGESTION_SOURCE,
}: SearchBarProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(resetOnCollapse ? '' : defaultValue ?? '')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isInputFocused, setIsInputFocused] = useState(false)
  const label = defaultValue && !resetOnCollapse
    ? `Buscar ${defaultValue}`
    : 'Buscar por negocio, categoria o necesidad...'
  const isTextInputSearch = size === 'hero' || size === 'inline'
  const isExpanded = size === 'inline' ? true : Boolean(expanded)
  const iconSize = size === 'hero' ? 34 : 21
  const suiteClassName =
    size === 'hero'
      ? 'sw-search-suite--hero'
      : size === 'inline'
      ? 'sw-search-suite--inline'
      : 'sw-search-suite'
  const triggerClassName = size === 'hero' ? 'sw-search-trigger--hero' : 'sw-search-trigger'
  const suggestions = useMemo(
    () => getSearchSuggestions(value, suggestionSource),
    [suggestionSource, value]
  )
  const inlineSuggestion = useMemo(() => {
    const query = value.trim()
    if (!query || suggestions.length === 0) return null

    const bestMatch = suggestions[0].label
    const completion = getInlineCompletion(bestMatch, value)
    if (!completion) return null

    return {
      label: bestMatch,
      completion,
    }
  }, [suggestions, value])
  const showSuggestions =
    isExpanded && isInputFocused && value.trim().length > 0 && suggestions.length > 0
  const showRecentSearches =
    isExpanded && isInputFocused && value.trim().length === 0 && recentSearches.length > 0

  useEffect(() => {
    if (size === 'hero' && expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded, size])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitSearch(value)
  }

  function submitSearch(nextValue: string) {
    const query = nextValue.trim()
    const params = new URLSearchParams(window.location.search)

    if (query) {
      params.set('q', query)
      setRecentSearches(writeRecentSearch(query))
      setValue(query)
    } else {
      params.delete('q')
      setValue('')
    }

    const queryString = params.toString()
    setIsInputFocused(false)
    onSearchSubmit?.()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  function acceptInlineSuggestion() {
    if (!inlineSuggestion) return false

    setValue(inlineSuggestion.label)
    window.requestAnimationFrame(() => inputRef.current?.focus())
    return true
  }

  if (isTextInputSearch) {
    return (
      <form className={suiteClassName} role="search" onSubmit={handleSubmit}>
        <div className="sw-search-input-wrapper">
          <button
            type="submit"
            className="sw-search-submit-button"
            aria-label="Buscar"
            disabled={size === 'hero' && !expanded}
          >
            <SearchIcon size={iconSize} />
          </button>
          <div className="sw-search-input-field">
            {inlineSuggestion ? (
              <div className="sw-search-inline-suggestion" aria-hidden="true">
                <span className="sw-search-inline-current">{value}</span>
                <span className="sw-search-inline-completion">{inlineSuggestion.completion}</span>
              </div>
            ) : null}
            <input
              ref={inputRef}
              type="text"
              className="sw-search-input--hero"
              placeholder={label}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if ((event.key === 'Tab' || event.key === 'ArrowRight') && acceptInlineSuggestion()) {
                  event.preventDefault()
                }
              }}
              onFocus={() => {
                setIsInputFocused(true)
                setRecentSearches(readRecentSearches())
              }}
              onBlur={() => {
                window.setTimeout(() => setIsInputFocused(false), 120)
              }}
              disabled={size === 'hero' && !expanded}
              role="combobox"
              aria-label="Buscar en el directorio"
              aria-autocomplete="both"
              aria-expanded={showSuggestions || showRecentSearches}
              aria-controls="sw-search-suggestions"
            />
          </div>
          {value ? (
            <button
              type="button"
              className="sw-search-clear-button"
              aria-label="Limpiar busqueda"
              disabled={size === 'hero' && !expanded}
              onClick={() => submitSearch('')}
            >
              <CloseIcon size={24} />
            </button>
          ) : null}
        </div>

        {(showSuggestions || showRecentSearches) && (
          <div id="sw-search-suggestions" className="sw-search-suggestions" role="listbox">
            {showRecentSearches && (
              <div className="sw-search-suggestion-section">
                <div className="sw-search-suggestion-header">
                  <span>Busquedas recientes</span>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setRecentSearches(clearRecentSearches())}
                  >
                    Limpiar
                  </button>
                </div>
                <div className="sw-search-suggestion-list">
                  {recentSearches.map((recent) => (
                    <div key={recent} className="sw-search-recent-row">
                      <button
                        type="button"
                        role="option"
                        aria-selected="false"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => submitSearch(recent)}
                      >
                        {recent}
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar busqueda reciente ${recent}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setRecentSearches(removeRecentSearch(recent))}
                      >
                        <CloseIcon size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && (
              <div className="sw-search-suggestion-section">
                <div className="sw-search-suggestion-header">
                  <span>Sugerencias</span>
                </div>
                <div className="sw-search-suggestion-list">
                  {suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.kind}-${suggestion.label}`}
                      type="button"
                      role="option"
                      aria-selected="false"
                      className="sw-search-suggestion-option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => submitSearch(suggestion.label)}
                    >
                      <span>{suggestion.label}</span>
                      <span>{getSuggestionKindLabel(suggestion.kind)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    )
  }

  return (
    <div className={suiteClassName}>
      <SmartSearchButton />
      <button
        type="button"
        className={triggerClassName}
        aria-label={defaultValue ? `Busqueda actual: ${defaultValue}` : 'Buscar'}
        aria-expanded={expanded}
        onClick={onClick}
      >
        <SearchIcon size={iconSize} />
      </button>
    </div>
  )
}

function getInlineCompletion(label: string, query: string): string | null {
  const normalizedLabel = normalizeSearchText(label)
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery || !normalizedLabel.startsWith(normalizedQuery)) return null

  let normalizedPrefix = ''
  let completionStartIndex = 0

  for (const character of label) {
    normalizedPrefix += normalizeSearchText(character)
    completionStartIndex += character.length

    if (normalizedPrefix.length >= normalizedQuery.length) break
  }

  const completion = label.slice(completionStartIndex)
  return completion || null
}

function getSuggestionKindLabel(kind: SearchSuggestionKind): string {
  if (kind === 'category') return 'Categoria'
  if (kind === 'business') return 'Negocio'
  if (kind === 'city') return 'Ciudad'
  if (kind === 'synonym') return 'Relacionado'
  if (kind === 'phrase') return 'Servicio'
  if (kind === 'keyword') return 'Servicio'
  return 'Servicio'
}
