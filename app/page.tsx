import type { Metadata } from 'next'
import ChatBubble from '@components/directorio/ChatBubble'
import {
  BusinessCard,
  DirectoryFilterPills,
  DirectoryMiaCard,
  type DirectoryFilterCategory,
  PublicNavbar,
} from '@src/components/public'
import { profilesService } from '@src/features/profiles/services/profiles.service'
import { buildSearchSuggestionSource } from '@src/components/public/search/searchSuggestions'
import { CATEGORIES } from '@src/shared/utils/categories'

export const metadata: Metadata = {
  title: 'Directorio publico',
  description: 'Directorio publico de negocios seleccionados por SW Mujeres.',
}

export const revalidate = 3600

type SearchParams = Promise<{ q?: string; categoria?: string; ciudad?: string }>

const directoryCategories: DirectoryFilterCategory[] = [
  { label: 'Todos', value: '' },
  { label: 'Belleza', value: 'Belleza y bienestar' },
  { label: 'Moda', value: 'Moda' },
  { label: 'Hogar', value: CATEGORIES[4] },
  { label: 'Bienestar', value: CATEGORIES[1] },
  { label: 'Servicios', value: 'Servicios profesionales' },
  { label: 'Alimentos', value: CATEGORIES[2] },
  { label: 'Otros', value: 'Otro' },
]

const temporaryDirectoryPhotos = [
  '/temp-directory-photos/photo-1.jpg',
  '/temp-directory-photos/photo-2.jpg',
  '/temp-directory-photos/photo-3.jpg',
  '/temp-directory-photos/photo-4.jpg',
  '/temp-directory-photos/photo-5.jpg',
  '/temp-directory-photos/photo-6.jpg',
]

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const categoria = params.categoria?.trim() ?? ''
  const ciudad = params.ciudad?.trim() ?? ''

  const filters = {
    q: q || undefined,
    categoria: categoria || undefined,
    ciudad: ciudad || undefined,
  }
  const suggestionFilters = {
    categoria: categoria || undefined,
    ciudad: ciudad || undefined,
  }

  // Conexion conservada: la home ahora es el directorio publico con la regla de visibilidad.
  const profiles = await profilesService.findAll(filters)
  const suggestionProfiles = q ? await profilesService.findAll(suggestionFilters) : profiles
  const searchSuggestionSource = buildSearchSuggestionSource(suggestionProfiles)

  return (
    <main className="sw-directory-page">
      <PublicNavbar
        activePath="/"
        searchDefaultValue={q}
        searchSuggestionSource={searchSuggestionSource}
      />

      <DirectoryFilterPills
        categories={directoryCategories}
        selectedCategory={categoria}
        sort="recent"
      />

      <section className="sw-directory-content" aria-label="Directorio SW Mujeres">
        <div className="sw-directory-results">
          {profiles.length > 0 ? (
            <div className="sw-directory-grid">
              <DirectoryMiaCard />
              {profiles.map((profile, index) => (
                <BusinessCard
                  key={profile.id}
                  name={profile.business_name}
                  category={profile.category ?? undefined}
                  city={profile.city ?? undefined}
                  description={profile.description ?? undefined}
                  imageUrl={
                    profile.directory_image_path ??
                    temporaryDirectoryPhotos[index % temporaryDirectoryPhotos.length]
                  }
                  slug={profile.slug}
                  isVerified={profile.is_verified}
                  offersDiscount={profile.offers_discount}
                  discountDetails={profile.discount_details ?? undefined}
                />
              ))}
            </div>
          ) : (
            <div className="sw-directory-empty">
              <p>Sin resultados</p>
              <h1>No encontramos resultados</h1>
              <span>Prueba con otra busqueda o revisa una categoria distinta del directorio.</span>
            </div>
          )}
        </div>
      </section>

      <ChatBubble />
    </main>
  )
}
