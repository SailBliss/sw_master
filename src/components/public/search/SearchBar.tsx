import { SearchIcon } from '@components/icons/ui'

type SearchBarProps = {
  defaultValue?: string
  size?: 'icon' | 'hero'
  onClick?: () => void
  expanded?: boolean
}

export function SearchBar({ defaultValue, size = 'icon', onClick, expanded }: SearchBarProps) {
  const label = defaultValue ? `Buscar ${defaultValue}` : 'Buscar en el directorio'
  const iconSize = size === 'hero' ? 34 : 21
  const suiteClassName = size === 'hero' ? 'sw-search-suite--hero' : 'sw-search-suite'
  const triggerClassName = size === 'hero' ? 'sw-search-trigger--hero' : 'sw-search-trigger'

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
        {size === 'hero' ? <span>{label}</span> : null}
      </button>
    </div>
  )
}
