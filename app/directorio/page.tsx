import { getProfiles } from '@/lib/data'
import { slugify, CATEGORIES } from '@/lib/utils'
import type { DirectoryProfile } from '@/lib/types'

const CITIES = [
  'Medellín',
  'Bogotá',
  'Cali',
  'Envigado',
  'Sabaneta',
  'Itagüí',
  'Bello',
  'Rionegro',
  'Retiro',
]

function buildUrl(params: {
  q?: string
  categoria?: string
  ciudad?: string
}): string {
  const parts: string[] = []
  if (params.q) parts.push(`q=${encodeURIComponent(params.q)}`)
  if (params.categoria) parts.push(`categoria=${encodeURIComponent(params.categoria)}`)
  if (params.ciudad) parts.push(`ciudad=${encodeURIComponent(params.ciudad)}`)
  return parts.length > 0 ? `/directorio?${parts.join('&')}` : '/directorio'
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '...'
}

function ProfileCard({ profile }: { profile: DirectoryProfile }) {
  const slug = slugify(profile.business_name)
  const shortDesc = profile.description ? truncate(profile.description, 80) : null

  return (
    <a
      href={`/directorio/${slug}`}
      className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 gap-3"
    >
      <div className="flex items-center gap-3">
        {profile.directory_image_path ? (
          <img
            src={profile.directory_image_path}
            alt={profile.business_name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {getInitials(profile.business_name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{profile.business_name}</p>
          <p className="text-xs text-gray-500 truncate">
            {profile.category ?? '—'}{profile.city ? ` · ${profile.city}` : ''}
          </p>
        </div>
      </div>

      {shortDesc && (
        <p className="text-sm text-gray-600 leading-relaxed">{shortDesc}</p>
      )}

      <div className="mt-auto">
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">
          ✓ SW Verificada
        </span>
      </div>
    </a>
  )
}

type SearchParams = Promise<{ q?: string; categoria?: string; ciudad?: string }>

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const categoria = params.categoria?.trim() ?? ''
  const ciudad = params.ciudad?.trim() ?? ''

  const profiles = await getProfiles({
    q: q || undefined,
    categoria: categoria || undefined,
    ciudad: ciudad || undefined,
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Directorio SW Mujeres</h1>
          <p className="text-gray-500 text-sm mt-1">
            Emprendimientos verificados de la comunidad SW Mujeres
          </p>
        </div>

        {/* Búsqueda */}
        <form method="get" action="/directorio" className="flex gap-2">
          {categoria && (
            <input type="hidden" name="categoria" value={categoria} />
          )}
          {ciudad && (
            <input type="hidden" name="ciudad" value={ciudad} />
          )}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar emprendimiento o descripción..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            Buscar
          </button>
          {(q || categoria || ciudad) && (
            <a
              href="/directorio"
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            >
              Limpiar
            </a>
          )}
        </form>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = categoria === cat
            const href = isActive
              ? buildUrl({ q: q || undefined, ciudad: ciudad || undefined })
              : buildUrl({ q: q || undefined, categoria: cat, ciudad: ciudad || undefined })
            return (
              <a
                key={cat}
                href={href}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  isActive
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:text-pink-600'
                }`}
              >
                {cat}
              </a>
            )
          })}
        </div>

        {/* Filtro de ciudad */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 font-medium">Ciudad:</span>
          <a
            href={buildUrl({ q: q || undefined, categoria: categoria || undefined })}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              !ciudad
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:text-pink-600'
            }`}
          >
            Todas
          </a>
          {CITIES.map((cit) => {
            const isActive = ciudad === cit
            const href = isActive
              ? buildUrl({ q: q || undefined, categoria: categoria || undefined })
              : buildUrl({ q: q || undefined, categoria: categoria || undefined, ciudad: cit })
            return (
              <a
                key={cit}
                href={href}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  isActive
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:text-pink-600'
                }`}
              >
                {cit}
              </a>
            )
          })}
        </div>

        {/* Conteo */}
        <p className="text-sm text-gray-500">
          {profiles.length === 0
            ? 'Sin resultados'
            : `${profiles.length} emprendimiento${profiles.length !== 1 ? 's' : ''} encontrado${profiles.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid o estado vacío */}
        {profiles.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-500 text-lg">
              No encontramos emprendimientos con esos filtros.
            </p>
            <a
              href="/directorio"
              className="inline-block text-pink-500 hover:underline text-sm"
            >
              Ver todos los emprendimientos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
