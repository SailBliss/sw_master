'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDownIcon } from '@components/icons/ui'
import type {
  DirectoryFilterCategory,
  DirectorySortValue,
} from '../directory/DirectoryFilterPills'
import { SearchBar } from '../search/SearchBar'
import type { SearchSuggestionSource } from '../search/searchSuggestions'

type PublicNavbarProps = {
  activePath?: string
  searchDefaultValue?: string
  searchSuggestionSource?: SearchSuggestionSource
  categories?: DirectoryFilterCategory[]
  selectedCategory?: string
  sort?: DirectorySortValue
  onSortChange?: (sort: DirectorySortValue) => void
  sortLabel?: string
}

const SORT_LABELS: Record<DirectorySortValue, string> = {
  recent: 'Mas recientes',
  name: 'Nombre',
}

export function PublicNavbar({
  activePath,
  searchDefaultValue,
  searchSuggestionSource,
  categories = [],
  selectedCategory = '',
  sort = 'recent',
  onSortChange,
  sortLabel,
}: PublicNavbarProps) {
  return (
    <Suspense fallback={<PublicNavbarShell />}>
      <PublicNavbarContent
        activePath={activePath}
        searchDefaultValue={searchDefaultValue}
        searchSuggestionSource={searchSuggestionSource}
        categories={categories}
        selectedCategory={selectedCategory}
        sort={sort}
        onSortChange={onSortChange}
        sortLabel={sortLabel}
      />
    </Suspense>
  )
}

function PublicNavbarShell() {
  return (
    <header className="sw-directory-navbar">
      <div className="sw-directory-navbar-inner">
        <Link
          href="/"
          className="sw-directory-navbar-logo"
          aria-label="Inicio del directorio SW"
        >
          <Image
            src="/principal_basic.svg"
            alt="SW Mujeres"
            width={92}
            height={56}
            unoptimized
            className="block h-8 w-auto object-contain sm:h-9"
            priority
          />
        </Link>
      </div>
    </header>
  )
}

function PublicNavbarContent({
  searchDefaultValue,
  searchSuggestionSource,
  categories = [],
  selectedCategory = '',
  sort = 'recent',
  onSortChange,
  sortLabel,
}: PublicNavbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateCategory(category: string) {
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
    <header className="sw-directory-navbar">
      <div className="sw-directory-navbar-inner">
        <Link
          href="/"
          className="sw-directory-navbar-logo"
          aria-label="Inicio del directorio SW"
        >
          <Image
            src="/principal_basic.svg"
            alt="SW Mujeres"
            width={92}
            height={56}
            unoptimized
            className="block h-8 w-auto object-contain sm:h-9"
            priority
          />
        </Link>

        <div className="sw-directory-navbar-controls">
          <label className="sw-directory-nav-select">
            <span className="sr-only">Categoria</span>
            <select
              value={selectedCategory}
              onChange={(event) => updateCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.value || 'all'} value={category.value}>
                  {category.value ? category.label : 'Categorias'}
                </option>
              ))}
            </select>
            <span aria-hidden="true">
              <ChevronDownIcon size={16} />
            </span>
          </label>

          <label className="sw-directory-nav-select">
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

        <div className="sw-directory-navbar-search">
          <SearchBar
            defaultValue={searchDefaultValue}
            size="inline"
            suggestionSource={searchSuggestionSource}
          />
        </div>
      </div>
    </header>
  )
}
