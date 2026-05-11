import Link from 'next/link'

type PublicNavbarProps = {
  activePath?: string
}

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/directorio', label: 'Directorio' },
  { href: '/inscripcion', label: 'Registro' },
]

export function PublicNavbar({ activePath }: PublicNavbarProps) {
  return (
    <header className="border-b border-[--sw-line] bg-[--bg]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-[--fg]">
          DirectorioSW
        </Link>
        <nav className="flex items-center gap-4 text-sm" aria-label="Navegacion publica">
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
