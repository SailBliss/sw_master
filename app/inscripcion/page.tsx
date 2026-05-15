'use client'

import { useEffect, useState } from 'react'
import { PagePlaceholder, PublicNavbar, SectionShell } from '@src/components/public'
import { supabasePublic } from '@src/shared/lib/supabase'
import type { ProductOption } from '@src/features/enrollment/types'

export default function InscripcionPage() {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError(null)

      // Conexion conservada: el flujo anterior cargaba planes activos desde Supabase.
      const { data, error: productsError } = await supabasePublic
        .from('products')
        .select('id, name, price_cop, duration_days')
        .eq('is_active', true)

      if (productsError) {
        setError('No se pudieron cargar los planes activos.')
        setLoading(false)
        return
      }

      setProducts((data ?? []) as ProductOption[])
      setLoading(false)
    }

    loadProducts()
  }, [])

  const backendNote = loading
    ? 'Conexion backend conservada: cargando products activos desde Supabase.'
    : error
    ? `Conexion backend conservada con error visible: ${error}`
    : `Conexion backend conservada: Supabase devolvio ${products.length} products activos. El submit seguira conectado luego a /api/solicitudes.`

  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <PublicNavbar activePath="/inscripcion" />
      <SectionShell eyebrow="Registro publico" title="Canvas del flujo de registro">
        <PagePlaceholder
          title="Flujo publico de registro"
          description="Aqui ira la experiencia para registrar una marca o servicio. La UI anterior fue neutralizada para reconstruir el flujo sin tocar el backend de solicitudes."
          backendNote={backendNote}
        />
      </SectionShell>
    </main>
  )
}
