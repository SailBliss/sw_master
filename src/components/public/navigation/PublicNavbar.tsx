'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
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
  showSearch?: boolean
  hideSearchWhenHeroVisible?: boolean
  categories?: DirectoryFilterCategory[]
  selectedCategory?: string
  sort?: DirectorySortValue
  onSortChange?: (sort: DirectorySortValue) => void
  sortLabel?: string
}

export function PublicNavbar({
  searchDefaultValue,
  searchSuggestionSource,
  showSearch = true,
  hideSearchWhenHeroVisible = false,
}: PublicNavbarProps) {
  return (
    <Suspense fallback={<PublicNavbarShell />}>
      <PublicNavbarContent
        searchDefaultValue={searchDefaultValue}
        searchSuggestionSource={searchSuggestionSource}
        showSearch={showSearch}
        hideSearchWhenHeroVisible={hideSearchWhenHeroVisible}
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
  showSearch = true,
  hideSearchWhenHeroVisible = false,
}: PublicNavbarProps) {
  const hideActivationOffset = 72
  const lastScrollYRef = useRef(0)
  const lastTouchYRef = useRef<number | null>(null)
  const [isHidden, setIsHidden] = useState(false)
  const [isHeroSearchVisible, setIsHeroSearchVisible] = useState(false)
  const shouldShowSearch = showSearch && !(hideSearchWhenHeroVisible && isHeroSearchVisible)

  useEffect(() => {
    lastScrollYRef.current = window.scrollY

    function updateNavbarVisibility() {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollYRef.current

      if (currentScrollY < hideActivationOffset) {
        setIsHidden(false)
      } else if (scrollDelta > 8) {
        setIsHidden(true)
      } else if (scrollDelta < -8) {
        setIsHidden(false)
      }

      lastScrollYRef.current = currentScrollY
    }

    function updateFromWheel(event: WheelEvent) {
      if (window.scrollY < hideActivationOffset || event.deltaY < -2) {
        setIsHidden(false)
        return
      }

      if (event.deltaY > 2) {
        setIsHidden(true)
      }
    }

    function updateTouchStart(event: TouchEvent) {
      lastTouchYRef.current = event.touches[0]?.clientY ?? null
    }

    function updateFromTouchMove(event: TouchEvent) {
      const previousTouchY = lastTouchYRef.current
      const currentTouchY = event.touches[0]?.clientY

      if (previousTouchY === null || currentTouchY === undefined) return

      const touchDelta = currentTouchY - previousTouchY

      if (window.scrollY < hideActivationOffset || touchDelta > 6) {
        setIsHidden(false)
      } else if (touchDelta < -6) {
        setIsHidden(true)
      }

      lastTouchYRef.current = currentTouchY
    }

    window.addEventListener('scroll', updateNavbarVisibility, { passive: true })
    window.addEventListener('wheel', updateFromWheel, { passive: true })
    window.addEventListener('touchstart', updateTouchStart, { passive: true })
    window.addEventListener('touchmove', updateFromTouchMove, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateNavbarVisibility)
      window.removeEventListener('wheel', updateFromWheel)
      window.removeEventListener('touchstart', updateTouchStart)
      window.removeEventListener('touchmove', updateFromTouchMove)
    }
  }, [])

  useEffect(() => {
    if (!hideSearchWhenHeroVisible) {
      return
    }

    const heroSearch = document.querySelector('.sw-directory-hero-search')

    if (!heroSearch) {
      return
    }

    const updateHeroSearchVisibility = () => {
      const rect = heroSearch.getBoundingClientRect()
      setIsHeroSearchVisible(rect.bottom > 0 && rect.top < window.innerHeight)
    }

    const initialFrame = window.requestAnimationFrame(updateHeroSearchVisibility)

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroSearchVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.01 },
    )

    observer.observe(heroSearch)
    window.addEventListener('resize', updateHeroSearchVisibility)

    return () => {
      window.cancelAnimationFrame(initialFrame)
      observer.disconnect()
      window.removeEventListener('resize', updateHeroSearchVisibility)
    }
  }, [hideSearchWhenHeroVisible])

  function openSmartSearch() {
    window.dispatchEvent(new CustomEvent('sw:open-chat'))
  }

  return (
    <>
      <header className={isHidden ? 'sw-directory-navbar sw-directory-navbar--hidden' : 'sw-directory-navbar'}>
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

          <div
            className={shouldShowSearch ? 'sw-directory-navbar-search' : 'sw-directory-navbar-search sw-directory-navbar-search--hidden'}
            aria-hidden={!shouldShowSearch}
          >
            {showSearch ? (
              <SearchBar
                defaultValue={searchDefaultValue}
                size="inline"
                suggestionSource={searchSuggestionSource}
              />
            ) : null}
          </div>

          <MiaRevealButton onClick={openSmartSearch} />
        </div>
      </header>
      <ChatBubble />
    </>
  )
}
