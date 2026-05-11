type BusinessCardProps = {
  name: string
  category?: string
  city?: string
  description?: string
}

export function BusinessCard({ name, category, city, description }: BusinessCardProps) {
  return (
    <article className="rounded-lg border border-[--sw-line] bg-sw-paper p-4">
      <div className="mb-4 aspect-[4/3] rounded-md bg-[--bg-alt]" aria-hidden="true" />
      <h3 className="text-base font-semibold text-[--fg]">{name}</h3>
      {(category || city) && (
        <p className="mt-1 text-xs text-[--fg-3]">
          {[category, city].filter(Boolean).join(' / ')}
        </p>
      )}
      {description && <p className="mt-3 text-sm leading-6 text-[--fg-2]">{description}</p>}
    </article>
  )
}
