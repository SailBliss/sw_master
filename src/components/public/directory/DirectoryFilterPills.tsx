'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersIcon } from '@components/icons/ui'
import { SearchBar } from '../search/SearchBar'
import type { SearchSuggestionSource } from '../search/searchSuggestions'

export type DirectoryFilterCategory = {
  label: string
  value: string
}

export type DirectorySortValue = 'recent' | 'name'

type DirectoryFilterPillsProps = {
  categories: DirectoryFilterCategory[]
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  sort?: DirectorySortValue
  onSortChange?: (sort: DirectorySortValue) => void
  onFiltersClick?: () => void
  filterLabel?: string
  sortLabel?: string
  searchDefaultValue?: string
  searchSuggestionSource?: SearchSuggestionSource
}

export function DirectoryFilterPills({
  categories,
  selectedCategory = '',
  onCategoryChange,
  onFiltersClick,
  filterLabel = 'Filtros',
  searchDefaultValue,
  searchSuggestionSource,
}: DirectoryFilterPillsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateDirectoryParams(updates: { category?: string }) {
    const params = new URLSearchParams(searchParams.toString())

    if (updates.category !== undefined) {
      if (updates.category) {
        params.set('categoria', updates.category)
      } else {
        params.delete('categoria')
      }
    }

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  function updateCategory(category: string) {
    onCategoryChange?.(category)

    if (onCategoryChange) return

    updateDirectoryParams({ category })
  }

  return (
    <div className="sw-directory-filters">
      <div className="sw-directory-filter-actions">
        <div className="sw-directory-filter-search">
          <SearchBar
            defaultValue={searchDefaultValue}
            size="compact"
            suggestionSource={searchSuggestionSource}
          />
        </div>

        {onFiltersClick ? (
          <button
            type="button"
            className="sw-directory-filter-button"
            onClick={onFiltersClick}
          >
            <SlidersIcon size={16} />
            <span>{filterLabel}</span>
          </button>
        ) : null}
      </div>

      <div
        className="sw-directory-filter-scroll"
        aria-label="Categorias del directorio"
      >
        {categories.slice(1).map((category) => {
          const isActive = category.value === selectedCategory

          return (
            <button
              key={category.value}
              type="button"
              className={isActive ? 'sw-directory-pill sw-directory-pill-active' : 'sw-directory-pill'}
              aria-pressed={isActive}
              onClick={() => updateCategory(category.value)}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
