import Link from 'next/link'
import { profilesService } from '@src/features/profiles/services/profiles.service'
import { slugify } from '@src/shared/utils/slugify'
import type { DirectoryProfile } from '@src/features/profiles/types'

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
  return text.slice(0, max).trimEnd() + '…'
}

function PreviewCard({ profile }: { profile: DirectoryProfile }) {
  const slug = slugify(profile.business_name)
  const shortDesc = profile.description ? truncate(profile.description, 80) : null

  return (
    <a
      href={`/directorio/${slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 gap-3"
    >
      <div className="flex items-center gap-3">
        {profile.directory_image_path ? (
          <img
            src={profile.directory_image_path}
            alt={profile.business_name}
            className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-pink-100"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {getInitials(profile.business_name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 truncate group-hover:text-pink-600 transition-colors">
            {profile.business_name}
          </p>
          <p className="text-xs text-stone-500 truncate">
            {profile.category ?? '—'}
            {profile.city ? ` · ${profile.city}` : ''}
          </p>
        </div>
      </div>
      {shortDesc && (
        <p className="text-sm text-stone-600 leading-relaxed">{shortDesc}</p>
      )}
      <div className="mt-auto">
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-pink-50 text-pink-600 px-2.5 py-0.5 rounded-full border border-pink-100">
          ✓ SW Verificada
        </span>
      </div>
    </a>
  )
}

export default async function LandingPage() {
  const profiles = await profilesService.findAll()
  const previewProfiles = profiles.slice(0, 4)

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">

      {/* NAV */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-stone-900 tracking-tight">SW Mujeres</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/directorio" className="text-stone-600 hover:text-pink-600 transition-colors">
              Directorio
            </Link>
            <Link
              href="/inscripcion"
              className="bg-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
            >
              Inscríbete
            </Link>
          </nav>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 flex flex-col items-center text-center gap-6">
          <span className="text-xs font-semibold tracking-widest text-pink-500 uppercase">
            SW Mujeres · Medellín
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight max-w-3xl">
            El directorio de emprendimientos de{' '}
            <span className="text-pink-500">mujeres verificadas</span>{' '}
            de Medellín
          </h1>
          <p className="text-lg text-stone-500 max-w-xl leading-relaxed">
            Busca, descubre y conecta directamente con emprendedoras de la
            comunidad SW — sin anuncios, sin intermediarios.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/directorio"
              className="bg-pink-500 text-white px-7 py-3 rounded-full font-semibold text-base hover:bg-pink-600 transition-colors shadow-sm"
            >
              Explorar el directorio
            </Link>
            <Link
              href="/inscripcion"
              className="border border-stone-300 text-stone-700 px-7 py-3 rounded-full font-semibold text-base hover:border-pink-300 hover:text-pink-600 transition-colors"
            >
              Inscribir mi negocio
            </Link>
          </div>
        </div>
      </section>

      {/* 2. METRICAS */}
      <section className="border-b border-stone-200 bg-pink-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-pink-200 uppercase tracking-wide">
                Miembras en la comunidad
              </dt>
              <dd className="text-4xl font-bold text-white">13.500+</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-pink-200 uppercase tracking-wide">
                Fundada en
              </dt>
              <dd className="text-4xl font-bold text-white">2020</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-pink-200 uppercase tracking-wide">
                Emprendimientos en el directorio
              </dt>
              <dd className="text-4xl font-bold text-white">
                {profiles.length > 0 ? profiles.length : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 3. QUE ES SW */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-semibold tracking-widest text-pink-500 uppercase">
              Quiénes somos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 leading-snug">
              Una comunidad privada de mujeres que se apoyan entre sí
            </h2>
          </div>
          <div className="space-y-4 text-stone-600 leading-relaxed">
            <p>
              SW Mujeres es un grupo privado de Facebook con más de 13.500
              mujeres verificadas en Medellín y el área metropolitana. Nació en
              2020 con una premisa simple: crear un espacio seguro donde las
              mujeres puedan apoyarse, recomendarse y crecer juntas.
            </p>
            <p>
              Pertenecer a SW no es automático — cada miembra pasa por un
              proceso de verificación. Eso hace que la comunidad sea de alta
              confianza y que las recomendaciones dentro de ella tengan un peso
              real.
            </p>
            <p>
              Este directorio nació porque las emprendedoras de SW merecían un
              espacio propio: un lugar donde las compradoras lleguen buscando,
              no interrumpidas por publicidad.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PREVIEW DIRECTORIO */}
      <section className="border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-widest text-pink-500 uppercase">
                Emprendimientos verificados
              </span>
              <h2 className="text-3xl font-bold text-stone-900">
                Conoce a algunas empresarias SW
              </h2>
            </div>
            <Link
              href="/directorio"
              className="self-start sm:self-auto text-sm font-medium text-pink-500 hover:text-pink-700 underline underline-offset-2 transition-colors whitespace-nowrap"
            >
              Ver todas →
            </Link>
          </div>

          {previewProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {previewProfiles.map((profile) => (
                <PreviewCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400">
              <p className="text-base">El directorio se está armando.</p>
              <p className="text-sm mt-1">Pronto habrá emprendimientos aquí.</p>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <Link
              href="/directorio"
              className="border border-stone-300 text-stone-700 px-6 py-2.5 rounded-full text-sm font-medium hover:border-pink-300 hover:text-pink-600 transition-colors"
            >
              Ver todas las empresarias SW
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SECCION EMPRESARIAS */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="text-xs font-semibold tracking-widest text-pink-500 uppercase">
              Para empresarias SW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 leading-snug">
              Tu negocio, visible donde buscan las que ya confían en ti
            </h2>
            <p className="text-stone-600 leading-relaxed text-base">
              Si eres miembra de SW Mujeres, puedes inscribir tu emprendimiento
              en el directorio. Una vez aprobado, tu perfil incluye nombre y
              descripción de tu negocio, categoría, ciudad, enlace directo a
              WhatsApp e Instagram, y el badge de{' '}
              <strong className="text-stone-800">SW Verificada</strong> — la
              señal que le dice a cualquier compradora que ya pasaste por el
              filtro de confianza de la comunidad.
            </p>
            <p className="text-stone-500 text-sm">
              Durante los primeros 90 días, la inscripción es completamente
              gratuita para miembras activas.
            </p>
            <Link
              href="/inscripcion"
              className="inline-block bg-pink-500 text-white px-8 py-3 rounded-full font-semibold text-base hover:bg-pink-600 transition-colors shadow-sm"
            >
              Inscribir mi negocio gratis
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-stone-900 text-stone-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-semibold text-white text-sm">SW Mujeres</p>
            <p className="text-xs text-stone-500">
              Directorio de emprendimientos verificados · Medellín, Colombia
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/directorio" className="hover:text-white transition-colors">Directorio</Link>
            <Link href="/inscripcion" className="hover:text-white transition-colors">Inscríbete</Link>
            <a
              href="https://www.facebook.com/groups/292942651995627"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Grupo de Facebook
            </a>
            <a
              href="https://www.instagram.com/swmujeres"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
          </nav>
        </div>
      </footer>

    </div>
  )
}
