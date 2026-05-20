'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import ChatBubble from '@components/directorio/ChatBubble'
import type {
  DirectoryFilterCategory,
  DirectorySortValue,
} from '../directory/DirectoryFilterPills'
import { SearchBar } from '../search/SearchBar'
import type { SearchSuggestionSource } from '../search/searchSuggestions'
import { MiaRevealButton } from '../ui/MiaRevealButton'

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

export function PublicNavbar({
  searchDefaultValue,
  searchSuggestionSource,
}: PublicNavbarProps) {
  return (
    <Suspense fallback={<PublicNavbarShell />}>
      <PublicNavbarContent
        searchDefaultValue={searchDefaultValue}
        searchSuggestionSource={searchSuggestionSource}
      />
    </Suspense>
  )
}

function PublicNavbarShell() {
  return (
    <header className="sw-directory-navbar">
      <div className="sw-directory-navbar-inner">
        <Link
          href="/directorio"
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
}: PublicNavbarProps) {
  function openSmartSearch() {
    window.dispatchEvent(new CustomEvent('sw:open-chat'))
  }

  return (
    <>
      <header className="sw-directory-navbar">
        <div className="sw-directory-navbar-inner">
          <Link
            href="/directorio"
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

          <MiaRevealButton onClick={openSmartSearch} />
        </div>
      </header>
      <ChatBubble />
    </>
  )
}
