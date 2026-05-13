import type { Metadata } from 'next'
import {
  BusinessCard,
  PagePlaceholder,
  PublicNavbar,
  SectionShell,
} from '@src/components/public'
import { profilesService } from '@src/features/profiles/services/profiles.service'
import { buildSearchSuggestionSource } from '@src/components/public/search/searchSuggestions'

export const metadata: Metadata = {
  title: 'Directorio publico',
  description: 'Canvas base para el futuro listado y filtrado publico de negocios.',
}

export const revalidate = 3600

type SearchParams = Promise<{ q?: string; categoria?: string; ciudad?: string }>

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
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <PublicNavbar
        activePath="/"
        searchDefaultValue={q}
        searchSuggestionSource={searchSuggestionSource}
      />

      <SectionShell eyebrow="Salida temporal" title="Vista minima de perfiles conectados">
        {profiles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.slice(0, 6).map((profile) => (
              <BusinessCard
                key={profile.id}
                name={profile.business_name}
                category={profile.category ?? undefined}
                city={profile.city ?? undefined}
                description={profile.description ?? undefined}
              />
            ))}
          </div>
        ) : (
          <PagePlaceholder
            title="Estado vacio del directorio"
            description="Aqui ira el estado vacio cuando no haya resultados o cuando el directorio aun no tenga negocios visibles."
          />
        )}
      </SectionShell>
    </main>
  )
}
