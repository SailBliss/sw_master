import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from '../search/SearchBar'

type PublicNavbarProps = {
  activePath?: string
  searchDefaultValue?: string
}

export function PublicNavbar({ searchDefaultValue }: PublicNavbarProps) {
  return (
    <header className="relative bg-[var(--sw-paper)]">
      <div className="flex w-full items-center py-1 pl-5 sm:pl-7">
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
        <SearchBar defaultValue={searchDefaultValue} />
      </div>
    </header>
  )
}
