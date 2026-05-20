import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SW Mujeres',
  description: 'Acceso al directorio publico de negocios seleccionados por SW Mujeres.',
}

export default function HomePage() {
  return (
    <main className="sw-home-gateway" aria-label="SW Mujeres">
      <Image
        src="/principal_basic.svg"
        alt="SW Mujeres"
        width={220}
        height={134}
        priority
        unoptimized
        className="sw-home-gateway-logo"
      />
      <Link href="/directorio" className="sw-home-gateway-button">
        Directorio
      </Link>
    </main>
  )
}
