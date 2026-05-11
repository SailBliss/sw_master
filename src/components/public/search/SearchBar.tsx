'use client'

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
  function openSmartSearch() {
    window.dispatchEvent(new CustomEvent('sw:open-chat'))
  }

  return (
    <div className="sw-search-suite">
      <form
        action={action}
        method="get"
        className="sw-search-popover"
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
          <button
            type="button"
            className="sw-search-ai-nudge"
            onClick={openSmartSearch}
            aria-label="Abrir chat con IA para recibir ayuda de busqueda"
          >
            <span className="sw-search-ai-mark" aria-hidden="true" />
            <span className="sw-search-ai-copy">
              <span>IA</span>
              <span>Ayuda</span>
            </span>
          </button>
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
    </div>
  )
}
