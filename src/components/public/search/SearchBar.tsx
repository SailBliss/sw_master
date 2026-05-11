type SearchBarProps = {
  action?: string
  name?: string
  placeholder?: string
  defaultValue?: string
  buttonLabel?: string
}

const suggestedSearches = ['Belleza a domicilio', 'Reposteria artesanal', 'Decoracion para eventos', 'Asesoria contable']

export function SearchBar({
  action = '/',
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
        <button type="submit" className="sw-search-popover-submit" aria-label={buttonLabel}>
          <span aria-hidden="true" />
        </button>
      </div>
      <div className="sw-search-popover-panel">
        <div className="sw-search-popover-content">
          <p className="sw-search-popover-label">Sugerencias</p>
          <div className="sw-search-popover-options" aria-label="Busquedas sugeridas">
            {suggestedSearches.map((search) => (
              <button key={search} type="submit" name={name} value={search}>
                <span className="sw-search-popover-lens" aria-hidden="true" />
                <span>{search}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  )
}
