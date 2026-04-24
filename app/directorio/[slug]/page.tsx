import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { profilesService } from '@src/features/profiles/services/profiles.service'
import { formatPhone } from '@src/shared/utils/formatPhone'
import TrackView from '@components/directorio/TrackView'
import ContactLinks from '@components/directorio/ContactLinks'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const profile = await profilesService.getBySlug(slug)
  if (!profile) return {}

  const title = profile.business_name
  const description =
    profile.description ??
    `${profile.business_name} — emprendedora verificada SW Mujeres.`

  return {
    title,
    description,
    openGraph: {
      title: `${title} · SW Mujeres`,
      description,
      url: `/directorio/${slug}`,
      type: 'profile',
      ...(profile.directory_image_path
        ? { images: [{ url: profile.directory_image_path, alt: title ?? '' }] }
        : {}),
    },
    twitter: {
      card: 'summary',
      title: `${title} · SW Mujeres`,
      description,
    },
  }
}

function JsonLd({ profile, slug }: { profile: import('@src/features/profiles/types').DirectoryProfile; slug: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://swmujeres.com'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: profile.business_name,
    description: profile.description ?? undefined,
    url: `${siteUrl}/directorio/${slug}`,
    telephone: profile.business_phone,
    ...(profile.instagram_handle
      ? { sameAs: [`https://instagram.com/${profile.instagram_handle}`] }
      : {}),
    ...(profile.website_url ? { sameAs: [profile.website_url] } : {}),
    ...(profile.directory_image_path ? { image: profile.directory_image_path } : {}),
    ...(profile.category ? { knowsAbout: profile.category } : {}),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CO',
      ...(profile.city ? { addressLocality: profile.city } : {}),
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const letters =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-700 ring-4 ring-white">
      {letters}
    </div>
  )
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params
  const profile = await profilesService.getBySlug(slug)

  if (!profile) notFound()

  const whatsappUrl = formatPhone(profile.business_phone)

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <JsonLd profile={profile} slug={slug} />
      <TrackView profileId={profile.id} />
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        {profile.directory_image_path ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white shadow">
            <Image
              src={profile.directory_image_path}
              alt={profile.business_name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        ) : (
          <Initials name={profile.business_name} />
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.business_name}</h1>
          {profile.full_name && (
            <p className="mt-0.5 text-sm text-gray-500">{profile.full_name}</p>
          )}
          {profile.category && (
            <p className="mt-1 text-sm font-medium text-pink-600">{profile.category}</p>
          )}
        </div>

        {/* Badge SW Verificada */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 ring-1 ring-pink-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clipRule="evenodd"
            />
          </svg>
          SW Verificada
        </span>
      </div>

      {/* Descripción */}
      {profile.description && (
        <p className="mt-8 text-center text-gray-700 leading-relaxed">{profile.description}</p>
      )}

      {/* Descuento SW */}
      {profile.offers_discount && profile.discount_details && (
        <div className="mt-6 rounded-xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
          <p className="text-sm font-semibold text-amber-800">Descuento especial SW</p>
          <p className="mt-1 text-sm text-amber-700">{profile.discount_details}</p>
        </div>
      )}

      {/* Acciones de contacto — con tracking de clicks */}
      <ContactLinks
        profileId={profile.id}
        whatsappUrl={whatsappUrl}
        instagramHandle={profile.instagram_handle}
        websiteUrl={profile.website_url}
        otherSocials={profile.other_socials}
      />
    </main>
  )
}
