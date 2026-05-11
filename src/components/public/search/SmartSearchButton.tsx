'use client'

type SmartSearchButtonProps = {
  label?: string
  hint?: string
  className?: string
}

export function SmartSearchButton({
  label = 'Buscar con IA',
  hint = 'Busqueda conversacional',
  className,
}: SmartSearchButtonProps) {
  function openSmartSearch() {
    window.dispatchEvent(new CustomEvent('sw:open-chat'))
  }

  return (
    <button
      type="button"
      className={className ? `sw-smart-search-button ${className}` : 'sw-smart-search-button'}
      onClick={openSmartSearch}
      aria-label="Abrir chat con IA para recibir ayuda de busqueda"
    >
      <span className="sw-smart-search-mark" aria-hidden="true" />
      <span className="sw-smart-search-copy">
        <span>{label}</span>
        <span>{hint}</span>
      </span>
    </button>
  )
}
