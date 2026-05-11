'use client'

import { useEffect, useState } from 'react'
import { PagePlaceholder, PublicNavbar, SectionShell } from '@src/components/public'
import { supabasePublic } from '@src/shared/lib/supabase'
import type { ProductOption } from '@src/features/enrollment/types'

export default function AliadasPage() {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError(null)

      // Conexion conservada: esta ruta manual tambien cargaba planes activos desde Supabase.
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
    : `Conexion backend conservada: Supabase devolvio ${products.length} products activos. Esta ruta seguira siendo manual/privada y no debe dominar la navegacion publica.`

  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <PublicNavbar />
      <SectionShell eyebrow="Ruta manual" title="Canvas para aliadas">
        <PagePlaceholder
          title="Flujo privado/manual de aliadas"
          description="Aqui ira la experiencia que la admin comparte manualmente con aliadas. La UI anterior fue neutralizada sin tocar /api/solicitudes ni los servicios de enrollment."
          backendNote={backendNote}
        />
      </SectionShell>
    </main>
  )
}
