'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from '../search/SearchBar'
import type { SearchSuggestionSource } from '../search/searchSuggestions'

type PublicNavbarProps = {
  activePath?: string
  searchDefaultValue?: string
  searchSuggestionSource?: SearchSuggestionSource
}

export function PublicNavbar({ searchDefaultValue, searchSuggestionSource }: PublicNavbarProps) {
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
