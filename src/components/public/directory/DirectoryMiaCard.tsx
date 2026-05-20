'use client'

import { SparkleIcon } from '@components/icons/ui'

export function DirectoryMiaCard() {
  function openSmartSearch() {
    window.dispatchEvent(new CustomEvent('sw:open-chat'))
  }

  return (
    <article className="sw-directory-mia-card" aria-label="Asistente Mia del directorio">
      <div className="sw-directory-mia-icon" aria-hidden="true">
        <SparkleIcon size={22} />
      </div>
      <h2>No sabes que buscar?</h2>
      <p>Cuentale a Mia que necesitas y te ayuda a encontrar opciones del directorio.</p>
      <button
        type="button"
        className="sw-directory-mia-action"
        onClick={openSmartSearch}
      >
        <span>Preguntarle a Mia</span>
        <span aria-hidden="true">-&gt;</span>
      </button>

      <div className="sw-directory-mia-divider" />

      <div className="sw-directory-mia-links" aria-hidden="true">
        <span>
          <MiaTrendIcon />
          Trending now
        </span>
        <span>
          <MiaBookmarkIcon />
          Saved listings
        </span>
      </div>
    </article>
  )
}

function MiaTrendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m3.5 13.5 4.3-4.3 3.1 3.1 5.6-5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.4 6.7h4.1v4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MiaBookmarkIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5.5 4.2c0-.8.6-1.4 1.4-1.4h6.2c.8 0 1.4.6 1.4 1.4v12.6L10 14.1l-4.5 2.7V4.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
