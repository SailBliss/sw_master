import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PagePlaceholder, PublicNavbar, SectionShell } from '@src/components/public'
import { trackingService } from '@src/features/tracking/services/tracking.service'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ token: string }>
}

export const metadata: Metadata = {
  title: 'Estadisticas de tu perfil - SW Mujeres',
  robots: { index: false, follow: false },
}

export default async function EstadisticasPage({ params }: Props) {
  const { token } = await params
  // Conexion conservada: la pagina sigue validando el token contra trackingService.
  const stats = await trackingService.getFullStats(token)

  if (!stats) notFound()

  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <PublicNavbar />
      <SectionShell eyebrow="Estadisticas privadas" title="Canvas de estadisticas por token">
        <PagePlaceholder
          title="Pagina de estadisticas"
          description="Aqui ira la vista privada por token para que una aliada vea vistas de perfil y clics de contacto."
          backendNote={`Conexion backend conservada: trackingService.getFullStats() valido el token y devolvio datos para ${stats.businessName}.`}
        />
      </SectionShell>
    </main>
  )
}
