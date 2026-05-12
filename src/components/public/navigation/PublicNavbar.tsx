'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { SearchBar } from '../search/SearchBar'
import type { SearchSuggestionSource } from '../search/searchSuggestions'

type PublicNavbarProps = {
  activePath?: string
  searchDefaultValue?: string
  searchSuggestionSource?: SearchSuggestionSource
}

export function PublicNavbar({ searchDefaultValue, searchSuggestionSource }: PublicNavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <header
        className="relative z-20 bg-[var(--sw-paper)]"
        onMouseLeave={() => setIsSearchOpen(false)}
      >
        <div className="relative flex w-full items-center py-1 pl-5 sm:pl-7">
          <div className="flex w-full items-center">
            <Link
              href="/"
              className="inline-flex min-h-[32px] items-center justify-center"
              aria-label="Inicio del directorio SW"
            >
              <Image
                src="/principal_basic.svg"
                alt="SW Mujeres"
                width={58}
                height={45}
                unoptimized
                className="block h-6 w-auto flex-none object-contain"
              />
            </Link>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <SearchBar
              defaultValue={searchDefaultValue}
              expanded={isSearchOpen}
              suggestionSource={searchSuggestionSource}
              onClick={() => setIsSearchOpen((current) => !current)}
            />
          </div>
        </div>

        <div
          className={`sw-navbar-search-panel absolute left-0 right-0 top-full bg-[var(--sw-paper)] ${
            isSearchOpen ? 'sw-navbar-search-panel--open' : ''
          }`}
          data-state={isSearchOpen ? 'open' : 'closed'}
          aria-hidden={!isSearchOpen}
        >
          <div className="sw-navbar-search-panel-inner px-5 pb-10 pt-8 sm:px-7 sm:pt-10 lg:px-12">
            <SearchBar
              key={searchDefaultValue ?? ''}
              defaultValue={searchDefaultValue}
              size="hero"
              expanded={isSearchOpen}
              suggestionSource={searchSuggestionSource}
              onSearchSubmit={() => setIsSearchOpen(false)}
            />
          </div>
        </div>
      </header>

      <div
        className={`sw-navbar-page-blur ${isSearchOpen ? 'sw-navbar-page-blur--open' : ''}`}
        aria-hidden="true"
      />
    </>
  )
}
