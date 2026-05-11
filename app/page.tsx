import type { Metadata } from 'next'
import {
  BusinessCard,
  CategoryChip,
  PagePlaceholder,
  PublicNavbar,
  SearchBar,
  SectionShell,
  SmartSearchButton,
} from '@src/components/public'
import { profilesService } from '@src/features/profiles/services/profiles.service'

export const metadata: Metadata = {
  title: 'SW Mujeres - Directorio publico',
  description:
    'Canvas base para reconstruir la experiencia publica del directorio conectado al backend actual.',
}

const mockCategories = ['Belleza', 'Hogar', 'Salud', 'Alimentos', 'Servicios']

const fallbackBusinesses = [
  {
    name: 'Marca ejemplo',
    category: 'Categoria',
    city: 'Medellin',
    description: 'Tarjeta mock para probar el nuevo sistema visual del directorio.',
  },
  {
    name: 'Servicio ejemplo',
    category: 'Servicios',
    city: 'Envigado',
    description: 'Espacio temporal para definir informacion, jerarquia y acciones.',
  },
  {
    name: 'Negocio ejemplo',
    category: 'Hogar',
    city: 'Sabaneta',
    description: 'Luego se conectara con perfiles aprobados y membresias activas.',
  },
]

export default async function HomePage() {
  // Conexion conservada: la home anterior consumia perfiles publicos desde Supabase.
  const profiles = await profilesService.findAll()
  const cards =
    profiles.length > 0
      ? profiles.slice(0, 3).map((profile) => ({
          name: profile.business_name,
          category: profile.category ?? undefined,
          city: profile.city ?? undefined,
          description: profile.description ?? 'Perfil publico conectado desde Supabase.',
        }))
      : fallbackBusinesses

  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <PublicNavbar activePath="/" />

      <SectionShell eyebrow="Home publica" title="Nuevo canvas del directorio">
        <div className="grid gap-5">
          <SearchBar placeholder="Buscar negocios, categorias o palabras clave" />
          <SmartSearchButton />
          <div className="flex flex-wrap gap-2">
            {mockCategories.map((category, index) => (
              <CategoryChip key={category} label={category} selected={index === 0} />
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Tarjetas mock" title="Grid inicial de negocios">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((business) => (
            <BusinessCard key={business.name} {...business} />
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <PagePlaceholder
          title="Home publica / directorio"
          description="Aqui ira la nueva experiencia principal con busqueda, categorias, chat inteligente y tarjetas de negocios."
          backendNote={`Conexion backend conservada: profilesService.findAll() devolvio ${profiles.length} perfiles publicos visibles.`}
        />
      </SectionShell>
    </main>
  )
}
