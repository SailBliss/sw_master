import Image from 'next/image'
import Link from 'next/link'

type BusinessCardProps = {
  name: string
  category?: string
  city?: string
  description?: string
  imageUrl?: string
  avatarUrl?: string
  slug?: string
  isVerified?: boolean
  offersDiscount?: boolean
  discountDetails?: string
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
  description,
  imageUrl,
  avatarUrl,
  slug,
}: BusinessCardProps) {
  const initials = getInitials(name)
  const href = slug ? `/directorio/${slug}` : undefined
  const summary = description?.trim() || 'Negocio seleccionado por SW Mujeres para encontrar y contactar con confianza.'
  const avatarSrc = avatarUrl ?? imageUrl

  const cardContent = (
    <article className="sw-business-card">
      <div className="sw-business-card-media">
        <div className="sw-business-card-image-shell">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Imagen de ${name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 28vw, 360px"
            />
          ) : (
            <div className="sw-business-card-placeholder" aria-hidden="true">
              <span>{initials}</span>
            </div>
          )}
        </div>
      </div>

      <div className="sw-business-card-body">
        <h3 className="sw-business-card-title">{name}</h3>
        <p className="sw-business-card-description">{summary}</p>

        <div className="sw-business-card-footer">
          <div className="sw-business-card-owner">
            <span className="sw-business-card-owner-avatar" aria-hidden="true">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <span>{initials}</span>
              )}
            </span>
            <span className="sw-business-card-owner-name">{name}</span>
          </div>

          <span className="sw-business-card-action" aria-hidden="true">
            Ver negocio
          </span>
        </div>
      </div>
    </article>
  )

  if (!href) {
    return cardContent
  }

  return (
    <Link
      href={href}
      className="sw-business-card-link"
      aria-label={`Ver negocio de ${name}`}
    >
      {cardContent}
    </Link>
  )
}
