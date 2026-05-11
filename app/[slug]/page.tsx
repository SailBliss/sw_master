import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PagePlaceholder, PublicNavbar, SectionShell } from '@src/components/public'
import { profilesService } from '@src/features/profiles/services/profiles.service'

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

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params
  // Conexion conservada: esta ruta sigue resolviendo el perfil publico por slug.
  const profile = await profilesService.getBySlug(slug)

  if (!profile) notFound()

  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <PublicNavbar activePath="/" />
      <SectionShell eyebrow="Perfil publico" title={profile.business_name}>
        <PagePlaceholder
          title="Perfil publico de negocio"
          description="Aqui ira la ficha detallada de una marca o servicio, con descripcion, imagenes, informacion de contacto y acciones de tracking."
          backendNote={`Conexion backend conservada: profilesService.getBySlug("${slug}") resolvio el perfil ${profile.id}. Tracking y enlaces de contacto se reconectaran en la nueva UI.`}
        />
      </SectionShell>
    </main>
  )
}
