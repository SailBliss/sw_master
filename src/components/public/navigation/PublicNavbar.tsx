import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from '../search/SearchBar'

type PublicNavbarProps = {
  activePath?: string
  searchDefaultValue?: string
}

const navItems = [
  { href: '/', label: 'Directorio' },
  { href: '/inscripcion', label: 'Registro' },
]

export function PublicNavbar({ activePath, searchDefaultValue }: PublicNavbarProps) {
  return (
    <header className="bg-[--bg]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:flex-nowrap">
        <Link href="/" className="flex h-11 w-11 items-center justify-center" aria-label="Inicio">
          <Image
            src="/principal_basic.svg"
            alt="SW Mujeres"
            width={44}
            height={44}
            unoptimized
            className="h-full w-full object-contain"
          />
        </Link>

        <div className="order-3 w-full lg:order-none lg:min-w-0 lg:flex-1">
          <SearchBar defaultValue={searchDefaultValue} />
        </div>

        <nav className="ml-auto flex items-center gap-4 text-sm" aria-label="Navegacion publica">
          {navItems.map((item) => {
            const active = activePath === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'font-semibold text-[--accent]' : 'text-[--fg-2]'}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
