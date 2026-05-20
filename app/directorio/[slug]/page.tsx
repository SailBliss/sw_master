import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProfileActionLinks from '@components/directorio/ProfileActionLinks'
import { SparkleIcon } from '@components/icons/ui'
import { PublicNavbar } from '@src/components/public'
import { profilesService } from '@src/features/profiles/services/profiles.service'
import type { DirectoryProfile } from '@src/features/profiles/types'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const profiles = await profilesService.findAll()
  return profiles.map((profile) => ({ slug: profile.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const profile = await profilesService.getBySlug(slug)
  if (!profile) return {}

  return {
    title: profile.business_name,
    description:
      profile.description ?? 'Perfil publico de negocio conectado al backend de DirectorioSW.',
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function getWhatsappUrl(profile: DirectoryProfile) {
  const phone = profile.business_phone.replace(/[^\d]/g, '')
  const message = encodeURIComponent(`Hola, encontre ${profile.business_name} en el directorio SW.`)
  return `https://wa.me/${phone}?text=${message}`
}

function getInstagramHandle(value: string | null) {
  if (!value) return null

  return value
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/[/?#].*$/, '')
}

function ProfileImage({ profile, className }: { profile: DirectoryProfile; className: string }) {
  if (profile.directory_image_path) {
    return (
      <img
        src={profile.directory_image_path}
        alt={profile.business_name}
        className={className}
      />
    )
  }

  return (
    <div className={`${className} sw-profile-image-fallback`} aria-label={profile.business_name}>
      {getInitials(profile.business_name)}
    </div>
  )
}

export default async function DirectoryProfilePage({ params }: Props) {
  const { slug } = await params
  const profile = await profilesService.getBySlug(slug)

  if (!profile) notFound()

  const whatsappUrl = getWhatsappUrl(profile)
  const instagramHandle = getInstagramHandle(profile.instagram_handle)
  const facts = [
    { label: 'Categoria', value: profile.category },
    { label: 'Empresaria', value: profile.full_name },
    { label: 'Zona / ciudad', value: profile.city },
    { label: 'Verificacion', value: profile.is_verified ? 'Verificada por SW' : null },
    { label: 'Descuento SW', value: profile.offers_discount ? profile.discount_details ?? 'Disponible' : null },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value))

  const chips = [
    profile.category,
    profile.city,
    profile.full_name ? `Empresaria: ${profile.full_name}` : null,
    profile.offers_discount ? 'Descuento SW' : null,
  ].filter((chip): chip is string => Boolean(chip))

  return (
    <main className="sw-profile-page">
      <PublicNavbar activePath="/directorio" />

      <div className="sw-profile-shell">
        <nav className="sw-profile-breadcrumb" aria-label="Breadcrumb">
          <Link href="/directorio">Directorio</Link>
          <span aria-hidden="true">/</span>
          <span>{profile.business_name}</span>
        </nav>

        <section className="sw-profile-hero" aria-labelledby="profile-title">
          <div className="sw-profile-gallery" aria-label={`Galeria de ${profile.business_name}`}>
            <div className="sw-profile-gallery-images">
              <div className="sw-profile-thumbnails" aria-hidden="true">
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`sw-profile-thumbnail ${item === 0 ? 'sw-profile-thumbnail-active' : ''}`}
                  >
                    <ProfileImage profile={profile} className="sw-profile-thumbnail-image" />
                  </div>
                ))}
                <div className="sw-profile-thumbnail-more">v</div>
              </div>

              <div className="sw-profile-main-image-wrap">
                <ProfileImage profile={profile} className="sw-profile-main-image" />
              </div>
            </div>

            <div className="sw-profile-verified-row">
              <span className="sw-profile-verified-icon" aria-hidden="true">
                <SparkleIcon size={18} />
              </span>
              <span>{profile.is_verified ? 'Verificada por SW' : profile.business_name}</span>
            </div>

            <h1 id="profile-title" className="sw-profile-title">
              {profile.business_name}
            </h1>

            {profile.description && (
              <p className="sw-profile-description">{profile.description}</p>
            )}
          </div>

          <article className="sw-profile-copy">
            {chips.length > 0 && (
              <div className="sw-profile-chips" aria-label="Datos clave">
                {chips.map((chip) => (
                  <span key={chip} className="sw-profile-chip">
                    <SparkleIcon size={15} />
                    {chip}
                  </span>
                ))}
              </div>
            )}

            <section className="sw-profile-info" aria-labelledby="profile-info-title">
              <h2 id="profile-info-title">Informacion del emprendimiento</h2>
              <div className="sw-profile-info-grid">
                {facts.map((item) => (
                  <div key={item.label} className="sw-profile-info-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <div className="sw-profile-contact-block">
              <span>Contacto directo</span>
              <p>
                {instagramHandle ? `Instagram @${instagramHandle}` : null}
                {instagramHandle && profile.website_url ? ' / ' : null}
                {profile.website_url ? 'Sitio web disponible' : null}
                {!instagramHandle && !profile.website_url ? 'WhatsApp disponible' : null}
              </p>
              {profile.other_socials && <small>{profile.other_socials}</small>}
            </div>

            <ProfileActionLinks
              profileId={profile.id}
              whatsappUrl={whatsappUrl}
              instagramHandle={instagramHandle}
              websiteUrl={profile.website_url}
            />
          </article>
        </section>
      </div>
    </main>
  )
}
