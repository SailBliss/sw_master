'use client'

import { SparkleIcon } from '@components/icons/ui'

export function DirectoryMiaCard() {
  function openSmartSearch() {
    window.dispatchEvent(new CustomEvent('sw:open-chat'))
  }

  return (
    <button
      type="button"
      className="sw-directory-mia-card"
      onClick={openSmartSearch}
      aria-label="Preguntarle a Mia para encontrar opciones del directorio"
    >
      <div className="sw-directory-mia-icon" aria-hidden="true">
        <SparkleIcon size={22} />
      </div>
      <h2>No sabes que buscar?</h2>
      <p>Cuentale a Mia que necesitas y te ayuda a encontrar opciones del directorio.</p>
      <span className="sw-directory-mia-action">Preguntarle a Mia</span>
    </button>
  )
}
