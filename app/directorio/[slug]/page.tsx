import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getProfileBySlug } from '@/lib/data'
import { formatPhone } from '@/lib/utils'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const profile = await getProfileBySlug(slug)
  if (!profile) return {}
  return {
    title: profile.business_name,
    description: profile.description ?? profile.business_name,
  }
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
  const profile = await getProfileBySlug(slug)

  if (!profile) notFound()

  const whatsappUrl = formatPhone(profile.business_phone)

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
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

      {/* Acciones de contacto */}
      <div className="mt-8 flex flex-col gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 1.9.526 3.676 1.441 5.192L2 22l4.961-1.408A9.954 9.954 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 0 1-4.34-1.284l-.31-.194-3.22.914.881-3.114-.214-.328A7.952 7.952 0 0 1 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"
              clipRule="evenodd"
            />
          </svg>
          Contactar por WhatsApp
        </a>

        {profile.instagram_handle && (
          <a
            href={`https://instagram.com/${profile.instagram_handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95"
          >
            Instagram · @{profile.instagram_handle}
          </a>
        )}

        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
          >
            {profile.website_url}
          </a>
        )}

        {profile.other_socials && (
          <p className="mt-1 text-center text-sm text-gray-500">{profile.other_socials}</p>
        )}
      </div>
    </main>
  )
}
