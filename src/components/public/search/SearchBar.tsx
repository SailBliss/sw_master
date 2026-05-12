'use client'

import { useEffect, useRef } from 'react'
import { SearchIcon } from '@components/icons/ui'

type SearchBarProps = {
  defaultValue?: string
  size?: 'icon' | 'hero'
  onClick?: () => void
  expanded?: boolean
}

export function SearchBar({ defaultValue, size = 'icon', onClick, expanded }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const label = defaultValue ? `Buscar ${defaultValue}` : 'Buscar en el directorio'
  const iconSize = size === 'hero' ? 34 : 21
  const suiteClassName = size === 'hero' ? 'sw-search-suite--hero' : 'sw-search-suite'
  const triggerClassName = size === 'hero' ? 'sw-search-trigger--hero' : 'sw-search-trigger'

  // Auto-focus cuando se expande el panel
  useEffect(() => {
    if (size === 'hero' && expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded, size])

  // Versión hero: input de búsqueda real
  if (size === 'hero') {
    return (
      <div className={suiteClassName}>
        <div className="sw-search-input-wrapper">
          <SearchIcon size={iconSize} />
          <input
            ref={inputRef}
            type="text"
            className="sw-search-input--hero"
            placeholder={label}
            defaultValue={defaultValue}
            disabled={!expanded}
            aria-label="Buscar en el directorio"
          />
        </div>
      </div>
    )
  }

  // Versión icono: botón de activación
  return (
    <div className={suiteClassName}>
      <button
        type="button"
        className={triggerClassName}
        aria-label={defaultValue ? `Busqueda actual: ${defaultValue}` : 'Buscar'}
        aria-expanded={expanded}
        onClick={onClick}
      >
        <SearchIcon size={iconSize} />
      </button>
    </div>
  )
}
