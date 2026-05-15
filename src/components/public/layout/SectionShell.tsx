import type { ReactNode } from 'react'

type SectionShellProps = {
  eyebrow?: string
  title?: string
  className?: string
  children: ReactNode
}

export function SectionShell({ eyebrow, title, className = '', children }: SectionShellProps) {
  return (
    <section className={`mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 ${className}`}>
      {(eyebrow || title) && (
        <header className="mb-5">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[--fg-3]">
              {eyebrow}
            </p>
          )}
          {title && <h2 className="mt-2 text-xl font-semibold text-[--fg]">{title}</h2>}
        </header>
      )}
      {children}
    </section>
  )
}
