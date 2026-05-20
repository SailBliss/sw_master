import type { Metadata } from 'next'
import Link from 'next/link'
import CategoryIcon from '@components/icons/categories/CategoryIcon'
import {
  BusinessCard,
  DirectoryMiaCard,
  SearchBar,
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

const directoryAvatarPreview = '/directory-avatar-preview.png'

const featuredCategories = [
  { label: 'Belleza', value: 'Belleza y bienestar', icon: 'Belleza' },
  { label: 'Gastronomia', value: CATEGORIES[2], icon: 'Alimentacion' },
  { label: 'Experiencias', value: 'Eventos', icon: 'Eventos' },
  { label: 'Bienestar', value: CATEGORIES[1], icon: 'Bienestar' },
  { label: 'Moda y diseno', value: 'Moda', icon: 'Moda' },
] as const

export default async function DirectoryPage({ searchParams }: { searchParams: SearchParams }) {
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

  const profiles = await profilesService.findAll(filters)
  const suggestionProfiles = q ? await profilesService.findAll(suggestionFilters) : profiles
  const searchSuggestionSource = buildSearchSuggestionSource(suggestionProfiles)

  return (
    <main className="sw-directory-page">
      <PublicNavbar
        activePath="/directorio"
        searchDefaultValue={q}
        searchSuggestionSource={searchSuggestionSource}
        categories={directoryCategories}
        selectedCategory={categoria}
        sort="recent"
      />

      <section className="sw-directory-content" aria-label="Directorio SW Mujeres">
        <div className="sw-directory-hero">
          <div className="sw-directory-hero-search">
            <SearchBar
              defaultValue={q}
              placeholder="Busca boutiques..."
              size="hero"
              expanded
              suggestionSource={searchSuggestionSource}
            />
          </div>

          <nav className="sw-directory-hero-categories" aria-label="Categorias destacadas">
            {featuredCategories.map((category) => {
              const isActive = category.value === categoria
              const params = new URLSearchParams()

              if (q) params.set('q', q)
              if (!isActive) params.set('categoria', category.value)
              if (ciudad) params.set('ciudad', ciudad)

              const href = params.toString() ? `/directorio?${params.toString()}` : '/directorio'

              return (
                <Link
                  key={category.value}
                  href={href}
                  className={isActive ? 'sw-directory-hero-chip sw-directory-hero-chip--active' : 'sw-directory-hero-chip'}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <CategoryIcon name={category.icon} size={16} />
                  <span>{category.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="sw-directory-section-kicker">
          <span>Descubrimiento editorial</span>
          <span aria-hidden="true">•••</span>
        </div>

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
                  avatarUrl={directoryAvatarPreview}
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
    </main>
  )
}
