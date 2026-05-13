'use client'

type SmartSearchButtonProps = {
  label?: string
  hint?: string
  className?: string
}

export function SmartSearchButton({
  label = '¿No encuentra lo que busca?',
  hint = 'Pregúntele a MIA',
  className,
}: SmartSearchButtonProps) {
  function openSmartSearch() {
    window.dispatchEvent(new CustomEvent('sw:open-chat'))
  }

  return (
    <button
      type="button"
      className={[
        'sw-smart-search-button',
        className,
      ].filter(Boolean).join(' ')}
      onClick={openSmartSearch}
      aria-label="Abrir MIA para recibir ayuda de busqueda"
    >
      <span className="sw-smart-search-copy" aria-hidden="true">
        <span>{label}</span>
        <span>{hint}</span>
      </span>
    </button>
  )
}
