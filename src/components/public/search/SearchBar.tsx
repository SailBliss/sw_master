type SearchBarProps = {
  action?: string
  name?: string
  placeholder?: string
  defaultValue?: string
  buttonLabel?: string
  variant?: 'default' | 'navbar'
  showSubmit?: boolean
}

const suggestedSearches = ['Belleza a domicilio', 'Reposteria artesanal', 'Decoracion para eventos', 'Asesoria contable']

export function SearchBar({
  action = '/',
  name = 'q',
  placeholder = 'Buscar por nombre, categoria o servicio...',
  defaultValue,
  buttonLabel = 'Buscar',
  variant = 'default',
  showSubmit = false,
}: SearchBarProps) {
  const suiteClassName = variant === 'navbar' ? 'sw-search-suite sw-search-suite-navbar' : 'sw-search-suite'
  const formClassName = variant === 'navbar' ? 'sw-search-popover sw-search-popover-navbar' : 'sw-search-popover'

  return (
    <div className={suiteClassName}>
      <form
        action={action}
        method="get"
        className={formClassName}
        autoComplete="off"
      >
        <div className="sw-search-popover-bar">
          <span className="sw-search-popover-icon" aria-hidden="true" />
          <input
            type="text"
            name={name}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="sw-search-popover-input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-autocomplete="none"
          />
          {showSubmit && (
            <button type="submit" className="sw-search-popover-submit" aria-label={buttonLabel}>
              <span aria-hidden="true" />
            </button>
          )}
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
    </div>
  )
}
