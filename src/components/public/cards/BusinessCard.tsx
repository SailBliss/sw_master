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
  category,
  description,
  imageUrl,
  avatarUrl,
  slug,
  offersDiscount = false,
  discountDetails,
}: BusinessCardProps) {
  const initials = getInitials(name)
  const href = slug ? `/${slug}` : undefined
  const summary = description || 'Negocio seleccionado por SW Mujeres.'

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

        <span className="sw-business-card-owner-avatar" aria-hidden="true">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <span>{initials}</span>
          )}
        </span>

        {offersDiscount && (
          <span className="sw-business-card-offer">
            {discountDetails?.trim() ? 'Beneficio SW' : 'Descuento SW'}
          </span>
        )}
      </div>

      <div className="sw-business-card-body">
        <div className="sw-business-card-heading">
          <h3>{name}</h3>
        </div>

        <p>{summary}</p>
        {category && <span className="sw-business-card-category">{category}</span>}
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
      aria-label={`Ver perfil de ${name}`}
    >
      {cardContent}
    </Link>
  )
}
