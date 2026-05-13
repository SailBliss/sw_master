import Image from 'next/image'
import Link from 'next/link'

type BusinessCardProps = {
  name: string
  category?: string
  city?: string
  description?: string
  imageUrl?: string
  slug?: string
  isVerified?: boolean
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function BusinessCard({
  name,
  category,
  city,
  description,
  imageUrl,
  slug,
  isVerified = false,
}: BusinessCardProps) {
  const initials = getInitials(name)
  const href = slug ? `/${slug}` : undefined
  const meta = [category, city].filter(Boolean).join(' / ')

  const cardContent = (
    <article className="group flex h-full flex-col overflow-hidden rounded-[19px] border border-[rgba(57,17,37,0.08)] bg-sw-paper shadow-[var(--shadow-xs)] transition duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[rgba(130,22,65,0.18)] hover:shadow-[var(--shadow-sm)] motion-reduce:transform-none">
      <div className="relative aspect-square overflow-hidden bg-[#f4f1ee]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Imagen de ${name}`}
            fill
            className="object-cover transition duration-300 ease-[var(--ease-out)] group-hover:scale-[1.015] motion-reduce:transform-none"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#f7f4f1,#ebe5df)]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.62),transparent_42%)]" />
            <span className="relative font-serif text-[34px] italic leading-none text-[rgba(57,17,37,0.34)]">
              {initials}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-h-[108px] flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-tight text-[--fg] line-clamp-2">
            {name}
          </h3>
          {isVerified && (
            <span className="mt-0.5 shrink-0 rounded-full bg-[rgba(130,22,65,0.07)] px-2 py-0.5 text-[10px] font-semibold leading-none text-[--accent]">
              SW
            </span>
          )}
        </div>

        {meta && <p className="mt-1 text-[12px] leading-5 text-[--fg-3]">{meta}</p>}

        {description && (
          <p className="mt-1.5 line-clamp-1 text-[13px] leading-5 text-[--fg-2]">{description}</p>
        )}
      </div>
    </article>
  )

  if (!href) {
    return cardContent
  }

  return (
    <Link
      href={href}
      className="block h-full rounded-[19px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(130,22,65,0.28)]"
      aria-label={`Ver perfil de ${name}`}
    >
      {cardContent}
    </Link>
  )
}
