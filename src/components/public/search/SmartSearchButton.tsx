'use client'

import { SparkleIcon } from '@components/icons/ui'

type SmartSearchButtonProps = {
  label?: string
  hint?: string
  className?: string
}

export function SmartSearchButton({
  label = 'Asistente IA',
  hint = 'Responde al instante',
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
      <span className="sw-smart-search-mark" aria-hidden="true">
        <SparkleIcon size={19} />
      </span>
      <span className="sw-smart-search-copy">
        <span>{label}</span>
        <span>{hint}</span>
      </span>
    </button>
  )
}
