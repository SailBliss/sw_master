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
  recent: 'Más recientes',
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
    <div className="w-full overflow-hidden bg-transparent py-2">
      <div className="flex w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div
          className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overscroll-x-contain py-1 [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden"
          aria-label="Categorias del directorio"
        >
          {categories.map((category) => {
            const isActive = category.value === selectedCategory

            return (
              <button
                key={category.value || 'all'}
                type="button"
                className={[
                  'inline-flex h-11 flex-none items-center justify-center rounded-full px-5 text-base font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--sw-rose-pale]',
                  isActive
                    ? 'bg-[--fg] text-sw-cream'
                    : 'bg-sw-pearl text-[--fg] hover:bg-[--sw-blush-mist] hover:text-[--accent]',
                ].join(' ')}
                aria-pressed={isActive}
                onClick={() => updateCategory(category.value)}
              >
                {category.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-none items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[--sw-line-strong] bg-sw-paper px-4 text-base font-semibold text-[--fg] transition-colors duration-200 hover:bg-sw-pearl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--sw-rose-pale] sm:px-5"
            onClick={onFiltersClick}
          >
            <SlidersIcon size={18} />
            <span className="hidden sm:inline">{filterLabel}</span>
          </button>

          <label className="relative inline-flex h-11 items-center rounded-full border border-[--sw-line-strong] bg-sw-paper text-base font-semibold text-[--fg] transition-colors duration-200 hover:bg-sw-pearl focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[--sw-rose-pale]">
            <span className="sr-only">Ordenar resultados</span>
            <select
              className="h-full appearance-none rounded-full bg-transparent pl-4 pr-10 text-base font-semibold outline-none sm:pl-5"
              value={sort}
              onChange={(event) => onSortChange?.(event.target.value as DirectorySortValue)}
            >
              <option value="recent">{sortLabel ?? SORT_LABELS.recent}</option>
              <option value="name">{SORT_LABELS.name}</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDownIcon size={18} />
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
