'use client'

import { SparkleIcon } from '@components/icons/ui'

type SmartSearchButtonProps = {
  label?: string
  hint?: string
  className?: string
}

export function SmartSearchButton({
  label = 'Chat con IA',
  hint = 'Consulta y descubre',
  className,
}: SmartSearchButtonProps) {
  function openSmartSearch() {
    window.dispatchEvent(new CustomEvent('sw:open-chat'))
  }

  return (
    <button
      type="button"
      className={[
        'inline-flex min-h-[52px] items-center gap-6 border-0 bg-transparent p-0 text-left text-[--fg] transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(130,22,65,0.30)]',
        className,
      ].filter(Boolean).join(' ')}
      onClick={openSmartSearch}
      aria-label="Abrir chat con IA para recibir ayuda de busqueda"
    >
      <span
        className="inline-grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border-0 bg-[--accent] text-[--sw-cream] shadow-[inset_0_0_0_1px_rgba(247,239,233,0.18)]"
        aria-hidden="true"
      >
        <SparkleIcon size={24} />
      </span>
      <span className="inline-flex min-w-0 items-center">
        <span
          className="whitespace-nowrap text-[21px] font-semibold leading-none text-[--sw-burgundy-dark]"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {label}
        </span>
      </span>
      <span
        className="mx-0.5 h-[29px] w-px shrink-0 bg-[rgba(191,120,72,0.42)]"
        aria-hidden="true"
      />
      <span className="inline-flex min-w-0 items-center">
        <span
          className="whitespace-nowrap text-[14.5px] font-normal leading-none text-[rgba(78,67,68,0.76)]"
          style={{ fontFamily: 'var(--font-body), Segoe UI, sans-serif' }}
        >
          {hint}
        </span>
      </span>
    </button>
  )
}
