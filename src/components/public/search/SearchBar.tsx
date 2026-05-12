import { SearchIcon } from '@components/icons/ui'

type SearchBarProps = {
  defaultValue?: string
}

export function SearchBar({ defaultValue }: SearchBarProps) {
  return (
    <div className="sw-search-suite">
      <button
        type="button"
        className="sw-search-trigger"
        aria-label={defaultValue ? `Busqueda actual: ${defaultValue}` : 'Buscar'}
      >
        <SearchIcon size={21} />
      </button>
    </div>
  )
}
