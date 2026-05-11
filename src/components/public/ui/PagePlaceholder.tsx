type PagePlaceholderProps = {
  eyebrow?: string
  title: string
  description: string
  backendNote?: string
}

export function PagePlaceholder({
  eyebrow = 'Canvas publico',
  title,
  description,
  backendNote,
}: PagePlaceholderProps) {
  return (
    <section className="rounded-lg border border-[--sw-line] bg-sw-paper p-6 text-[--fg]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[--fg-3]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[--fg-2]">{description}</p>
      {backendNote && (
        <p className="mt-4 rounded-md border border-dashed border-[--sw-line-strong] bg-[--bg] p-3 text-xs leading-5 text-[--fg-3]">
          {backendNote}
        </p>
      )}
    </section>
  )
}
