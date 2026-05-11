type SearchBarProps = {
  action?: string
  name?: string
  placeholder?: string
  defaultValue?: string
  buttonLabel?: string
}

const quickSearches = ['Belleza', 'Hogar', 'Alimentos', 'Servicios']

export function SearchBar({
  action = '/directorio',
  name = 'q',
  placeholder = 'Buscar negocio, categoria o palabra clave',
  defaultValue,
  buttonLabel = 'Buscar',
}: SearchBarProps) {
  return (
    <form
      action={action}
      method="get"
      className="sw-search-popover"
    >
      <div className="sw-search-popover-bar">
        <span className="sw-search-popover-icon" aria-hidden="true" />
        <input
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="sw-search-popover-input"
        />
        <button type="submit" className="sw-search-popover-submit">
          {buttonLabel}
        </button>
      </div>
      <div className="sw-search-popover-panel">
        <div className="sw-search-popover-content">
          <div className="sw-search-popover-empty">
            <span className="sw-search-popover-lens" aria-hidden="true" />
            <strong>Empieza a buscar</strong>
            <span>Escribe una categoria, ciudad, producto o servicio.</span>
          </div>
          <div className="sw-search-popover-options" aria-label="Busquedas rapidas">
            {quickSearches.map((search) => (
              <button key={search} type="submit" name={name} value={search}>
                <span>{search}</span>
                <small>Ver perfiles</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  )
}
