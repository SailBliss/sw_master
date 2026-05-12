import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from '../search/SearchBar'

type PublicNavbarProps = {
  activePath?: string
  searchDefaultValue?: string
}

export function PublicNavbar({ searchDefaultValue }: PublicNavbarProps) {
  return (
    <header>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_minmax(0,640px)_1fr]">
        <Link
          href="/"
          className="inline-flex min-h-[38px] justify-self-start items-center justify-center"
          aria-label="Inicio del directorio SW"
        >
          <Image
            src="/logo-largo.svg"
            alt="SW Mujeres"
            width={145}
            height={48}
            unoptimized
            className="block h-10 w-auto flex-none object-contain"
          />
        </Link>

        <div className="w-full justify-self-center">
          <SearchBar defaultValue={searchDefaultValue} />
        </div>
      </div>
    </header>
  )
}
