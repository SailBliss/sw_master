'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDownIcon, SlidersIcon } from '@components/icons/ui'

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
}

const SORT_LABELS: Record<DirectorySortValue, string> = {
  recent: 'Mas recientes',
  name: 'Nombre',
}

export function DirectoryFilterPills({
  categories,
  selectedCategory = '',
  onCategoryChange,
  sort = 'recent',
  onSortChange,
  onFiltersClick,
  filterLabel = 'Filtros',
  sortLabel,
}: DirectoryFilterPillsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateCategory(category: string) {
    onCategoryChange?.(category)

    if (onCategoryChange) return

    const params = new URLSearchParams(searchParams.toString())

    if (category) {
      params.set('categoria', category)
    } else {
      params.delete('categoria')
    }

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  return (
    <div className="sw-directory-filters">
      <div
        className="sw-directory-filter-scroll"
        aria-label="Categorias del directorio"
      >
        {categories.map((category) => {
          const isActive = category.value === selectedCategory

          return (
            <button
              key={category.value || 'all'}
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

      <div className="sw-directory-filter-actions">
        <button
          type="button"
          className="sw-directory-filter-button"
          onClick={onFiltersClick}
        >
          <SlidersIcon size={16} />
          <span>{filterLabel}</span>
        </button>

        <label className="sw-directory-sort">
          <span className="sr-only">Ordenar resultados</span>
          <select
            value={sort}
            onChange={(event) => onSortChange?.(event.target.value as DirectorySortValue)}
          >
            <option value="recent">{sortLabel ?? SORT_LABELS.recent}</option>
            <option value="name">{SORT_LABELS.name}</option>
          </select>
          <span aria-hidden="true">
            <ChevronDownIcon size={16} />
          </span>
        </label>
      </div>
    </div>
  )
}
