'use client'

import { Suspense, useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { PublicNavbar, SectionShell } from '@src/components/public'
import { supabasePublic } from '@src/shared/lib/supabase'
import { CATEGORIES } from '@src/shared/utils/categories'
import type { ProductOption } from '@src/features/enrollment/types'

type SubmitState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string | null
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-[0.14em] text-[--fg-3]">
      {children}
    </label>
  )
}

const inputClass = 'mt-2 w-full rounded-xl border border-[--sw-line] bg-[--sw-paper] px-4 py-3 text-sm text-[--fg] outline-none transition focus:border-[--accent] focus:ring-2 focus:ring-[rgba(126,55,78,0.12)]'

export default function InscripcionPage() {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [offersDiscount, setOffersDiscount] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle', message: null })

  useEffect(() => {
    async function loadProducts() {
      setProductsLoading(true)
      setProductsError(null)

      const { data, error } = await supabasePublic
        .from('products')
        .select('id, name, price_cop, duration_days')
        .eq('is_active', true)
        .order('price_cop', { ascending: true })

      if (error) {
        setProductsError('No pudimos cargar los planes activos. Intenta de nuevo mas tarde.')
        setProductsLoading(false)
        return
      }

      setProducts((data ?? []) as ProductOption[])
      setProductsLoading(false)
    }

    loadProducts()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState({ status: 'submitting', message: null })

    const formData = new FormData(event.currentTarget)
    formData.set('offers_discount', offersDiscount ? 'true' : 'false')
    formData.set('consent_accepted', formData.get('consent_accepted') === 'on' ? 'true' : 'false')

    try {
      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        body: formData,
      })
      const responseText = await response.text()
      let result: { success: boolean; message?: string }
      try {
        result = responseText
          ? JSON.parse(responseText) as { success: boolean; message?: string }
          : { success: false, message: 'El servidor no devolvio una respuesta valida.' }
      } catch {
        result = { success: false, message: 'El servidor no devolvio una respuesta valida.' }
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'No se pudo enviar la solicitud.')
      }

      event.currentTarget.reset()
      setOffersDiscount(false)
      setSubmitState({
        status: 'success',
        message: result.message ?? 'Tu solicitud fue enviada. Revisaremos tu informacion pronto.',
      })
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'No se pudo enviar la solicitud.',
      })
    }
  }

  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <Suspense fallback={null}>
        <PublicNavbar activePath="/inscripcion" />
      </Suspense>
      <SectionShell
        eyebrow="Inscripcion"
        title="Registra tu negocio"
      >
        <p className="mx-auto mb-5 max-w-3xl text-sm text-[--fg-2]">
          El formulario empieza por tu cedula para que el sistema pueda reconocer reinscripciones sin exponer datos personales.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-[28px] border border-[--sw-line] bg-[--sw-paper] p-6 shadow-sm md:p-8">
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-[--accent]">1. Identificacion</p>
                <p className="mt-1 text-sm text-[--fg-2]">Si ya te registraste antes, usaremos tu cedula para asociar esta nueva solicitud a tu perfil existente.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="cedula">Cedula</FieldLabel>
                  <input id="cedula" name="cedula" required minLength={6} maxLength={12} inputMode="numeric" className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="full_name">Nombre completo</FieldLabel>
                  <input id="full_name" name="full_name" required className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="email">Correo</FieldLabel>
                  <input id="email" name="email" required type="email" className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="phone">Telefono personal</FieldLabel>
                  <input id="phone" name="phone" required placeholder="+573001234567" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel htmlFor="fb_profile_url">Perfil de Facebook</FieldLabel>
                  <input id="fb_profile_url" name="fb_profile_url" required type="url" placeholder="https://facebook.com/tu-perfil" className={inputClass} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-[--accent]">2. Negocio</p>
                <p className="mt-1 text-sm text-[--fg-2]">Estos datos alimentan la revision interna antes de publicar un perfil.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="business_name">Nombre del negocio</FieldLabel>
                  <input id="business_name" name="business_name" required className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="category">Categoria</FieldLabel>
                  <select id="category" name="category" required className={inputClass}>
                    <option value="">Selecciona una categoria</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <FieldLabel htmlFor="description">Descripcion</FieldLabel>
                  <textarea id="description" name="description" required minLength={10} maxLength={300} rows={4} className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="business_phone">WhatsApp del negocio</FieldLabel>
                  <input id="business_phone" name="business_phone" required placeholder="+573001234567" className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="instagram_handle">Instagram</FieldLabel>
                  <input id="instagram_handle" name="instagram_handle" placeholder="@usuario o URL" className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="website_url">Sitio web</FieldLabel>
                  <input id="website_url" name="website_url" type="url" placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="other_socials">Otras redes</FieldLabel>
                  <input id="other_socials" name="other_socials" className={inputClass} />
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-[--sw-line] bg-[--bg-alt] p-4 text-sm text-[--fg-2]">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={offersDiscount}
                  onChange={(event) => setOffersDiscount(event.target.checked)}
                />
                <span>Ofrezco un descuento o beneficio especial para la comunidad SW.</span>
              </label>
              {offersDiscount && (
                <div>
                  <FieldLabel htmlFor="discount_details">Detalle del descuento</FieldLabel>
                  <textarea id="discount_details" name="discount_details" rows={3} className={inputClass} />
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-[--accent]">3. Plan y soporte</p>
                <p className="mt-1 text-sm text-[--fg-2]">Los pagos de planes pagos se completan despues de la aprobacion admin mediante Wompi.</p>
              </div>
              <div>
                <FieldLabel htmlFor="product_id">Plan</FieldLabel>
                <select id="product_id" name="product_id" required disabled={productsLoading || products.length === 0} className={inputClass}>
                  <option value="">{productsLoading ? 'Cargando planes...' : 'Selecciona un plan'}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.price_cop === 0 ? 'Gratis' : `$${product.price_cop.toLocaleString('es-CO')} COP`}
                    </option>
                  ))}
                </select>
                {productsError && <p className="mt-2 text-sm text-red-700">{productsError}</p>}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="receipt">Comprobante legacy opcional</FieldLabel>
                  <input id="receipt" name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className={inputClass} />
                </div>
                <div>
                  <FieldLabel htmlFor="post_screenshot">Captura del post opcional</FieldLabel>
                  <input id="post_screenshot" name="post_screenshot" type="file" accept="image/*" className={inputClass} />
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-[--sw-line] bg-[--bg-alt] p-4 text-sm text-[--fg-2]">
                <input name="consent_accepted" type="checkbox" required className="mt-1" />
                <span>Acepto que SW Mujeres revise mi informacion para evaluar la solicitud de ingreso al directorio.</span>
              </label>
            </section>

            {submitState.message && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${
                submitState.status === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                {submitState.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitState.status === 'submitting' || productsLoading || products.length === 0}
              className="w-full rounded-full bg-[--accent] px-6 py-3 text-sm font-semibold text-[--sw-cream] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitState.status === 'submitting' ? 'Enviando solicitud...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </SectionShell>
    </main>
  )
}
