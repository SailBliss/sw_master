'use client'

import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { PublicNavbar } from '@src/components/public'
import { supabasePublic } from '@src/shared/lib/supabase'
import { CATEGORIES } from '@src/shared/utils/categories'
import type { ProductOption } from '@src/features/enrollment/types'
import { DescriptionReviewPanel } from '@src/features/profile-editorial-review/components/DescriptionReviewPanel'
import type { AcceptedReview } from '@src/features/profile-editorial-review/components/DescriptionReviewPanel'
import type { ApplicationEditorialStatus, ReviewResult } from '@src/features/profile-editorial-review/types'
import { ChevronDownIcon, CloseIcon } from '@components/icons/ui'

type SubmitState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string | null
}

type EditorialReviewState = {
  status: ApplicationEditorialStatus
  reviewId: string
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-[--fg]">
      {children}
    </label>
  )
}

function FormIcon({ type }: { type: 'user' | 'badge' | 'mail' | 'phone' | 'link' | 'store' | 'category' | 'instagram' | 'globe' | 'upload' | 'lock' | 'shield' | 'eye' | 'trend' | 'check' | 'arrow' }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  return (
    <svg {...common}>
      {type === 'user' && <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>}
      {type === 'badge' && <><path d="M8 7V5a4 4 0 0 1 8 0v2" /><rect x="5" y="7" width="14" height="14" rx="2" /><path d="M9 13h6" /><path d="M9 17h3" /></>}
      {type === 'mail' && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>}
      {type === 'phone' && <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z" /></>}
      {type === 'link' && <><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></>}
      {type === 'store' && <><path d="M4 10h16" /><path d="M5 10l1-6h12l1 6" /><path d="M6 10v10h12V10" /><path d="M9 20v-5h6v5" /></>}
      {type === 'category' && <><path d="m12 3 4 7H8l4-7Z" /><rect x="4" y="14" width="6" height="6" rx="1" /><circle cx="17" cy="17" r="3" /></>}
      {type === 'instagram' && <><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.2" /><path d="M16.8 7.2h.01" /></>}
      {type === 'globe' && <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20" /><path d="M12 2a15.3 15.3 0 0 0 0 20" /></>}
      {type === 'upload' && <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M20 16.5a4.5 4.5 0 0 1-2.5 8H7a5 5 0 0 1-.9-9.9" /></>}
      {type === 'lock' && <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>}
      {type === 'shield' && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></>}
      {type === 'eye' && <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>}
      {type === 'trend' && <><path d="m3 17 6-6 4 4 7-7" /><path d="M14 8h6v6" /></>}
      {type === 'check' && <path d="m5 12 4 4L19 6" />}
      {type === 'arrow' && <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>}
    </svg>
  )
}

function IconInput({ children, icon }: { children: ReactNode; icon: Parameters<typeof FormIcon>[0]['type'] }) {
  return (
    <div className="relative group">
      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[--fg-2] transition-colors group-focus-within:text-[--accent]">
        <FormIcon type={icon} />
      </span>
      {children}
    </div>
  )
}

const inputClass = 'mt-2 min-h-12 w-full rounded-lg border border-[rgba(217,193,196,0.78)] bg-[#fff8f7] px-4 py-3 text-base text-[--fg] outline-none transition placeholder:text-[rgba(84,66,69,0.72)] focus:border-[--accent] focus:bg-white focus:ring-2 focus:ring-[rgba(126,55,78,0.12)]'
const iconInputClass = `${inputClass} pl-12`
const sectionVisibility = (isActive: boolean) => isActive ? 'block' : 'hidden'

export default function InscripcionPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [offersDiscount, setOffersDiscount] = useState(false)
  const [description, setDescription] = useState('')
  const [editorialReview, setEditorialReview] = useState<EditorialReviewState>({ status: 'requiere_revision_manual', reviewId: '' })
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

    if (currentStep === 1) {
      goToBusinessStep()
      return
    }

    if (!event.currentTarget.reportValidity()) return

    setSubmitState({ status: 'submitting', message: null })

    const formData = new FormData(event.currentTarget)
    formData.set('offers_discount', offersDiscount ? 'true' : 'false')
    formData.set('consent_accepted', formData.get('consent_accepted') === 'on' ? 'true' : 'false')
    formData.set('description_editorial_status', editorialReview.status)
    formData.set('description_review_id', editorialReview.reviewId)

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
      setDescription('')
      setEditorialReview({ status: 'requiere_revision_manual', reviewId: '' })
      setCurrentStep(1)
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

  function handleDescriptionChange(value: string) {
    setDescription(value)
    setEditorialReview({ status: 'requiere_revision_manual', reviewId: '' })
  }

  function handleReviewResult(result: ReviewResult) {
    setEditorialReview({ status: 'ia_sugerida', reviewId: result.reviewId })
  }

  function handleReviewAccept(result: AcceptedReview) {
    setDescription(result.acceptedText)
    setEditorialReview({ status: 'ia_aceptada', reviewId: result.reviewId })
  }

  function goToBusinessStep() {
    const form = formRef.current
    if (!form) return

    const personalFields = ['full_name', 'cedula', 'email', 'phone', 'fb_profile_url', 'consent_accepted']
    for (const fieldName of personalFields) {
      const field = form.elements.namedItem(fieldName)
      if (field instanceof HTMLInputElement && !field.reportValidity()) return
    }

    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-[#e4d7d6] text-[--fg]">
      <Suspense fallback={null}>
        <PublicNavbar activePath="/inscripcion" />
      </Suspense>

      <section className="relative overflow-hidden px-4 py-8 md:px-8 md:py-12" aria-label="Formulario de inscripcion">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.09]"
          style={{ backgroundImage: 'radial-gradient(#5e162c 0.7px, transparent 0.7px)', backgroundSize: '24px 24px' }}
        />

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-[rgba(217,193,196,0.45)] bg-white shadow-[0_10px_40px_rgba(61,53,53,0.08)] md:min-h-[760px] md:flex-row"
        >
          <aside className="relative flex flex-col overflow-hidden bg-[#fff0f0] p-7 md:w-[400px] md:flex-shrink-0 md:p-12">
            <div aria-hidden="true" className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[rgba(94,22,44,0.05)] blur-3xl" />
            <div className="relative z-10">
              <h1 className="max-w-[12rem] font-[var(--font-display)] text-4xl font-medium leading-[1.08] text-[--accent] md:text-[44px]">
                Unete a Directorio SW
              </h1>
              <div className="mt-5 h-1 w-12 rounded-full bg-[#d3b277]" />
              <p className="mt-8 text-base leading-7 text-[--fg-2]">
                Conecta tu emprendimiento con una comunidad de <strong className="font-bold text-[--accent]">13.500 mujeres verificadas</strong> en Medellin y area metropolitana.
              </p>
            </div>

            <div className="relative z-10 mt-9 grid gap-7">
              {[
                { icon: 'shield' as const, title: 'Comunidad verificada', copy: 'Tu perfil es revisado y aprobado por el equipo SW.' },
                { icon: 'eye' as const, title: 'Mas visibilidad', copy: 'Apareces en nuestro directorio y llegas a mujeres que te necesitan.' },
                { icon: 'trend' as const, title: 'Resultados reales', copy: 'Empresarias SW generan conexiones y nuevas oportunidades cada dia.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[#eddfdf] text-[--accent]">
                    <FormIcon type={item.icon} />
                  </span>
                  <span>
                    <strong className="block text-base font-bold text-[--fg]">{item.title}</strong>
                    <span className="mt-1 block text-sm leading-6 text-[--fg-2]">{item.copy}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-10 flex items-start gap-3 border-t border-[rgba(217,193,196,0.55)] pt-8 text-sm leading-6 text-[--fg-2] md:mt-auto">
              <span className="mt-1 text-[#5b4413]"><FormIcon type="lock" /></span>
              <span>Tu informacion esta segura con nosotras. Nunca compartimos tus datos.</span>
            </div>
          </aside>

          <div className="relative flex-1 bg-white p-6 md:p-12">
            <Link
              href="/directorio"
              aria-label="Cerrar formulario e ir al directorio"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full text-[--fg-2] transition hover:bg-[#f9ebea] focus:outline-none focus:ring-2 focus:ring-[rgba(126,55,78,0.2)]"
            >
              <CloseIcon size={24} />
            </Link>

            <div className="mx-auto max-w-[600px]">
              <nav className="mb-12 flex items-start justify-center pt-8" aria-label="Progreso del formulario">
                <div className="grid w-full max-w-[410px] grid-cols-[1fr_120px_1fr] items-start">
                  <div className="flex flex-col items-center text-center">
                    <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold shadow-[0_10px_20px_rgba(94,22,44,0.16)] ${currentStep === 1 ? 'bg-[--accent] text-white' : 'bg-[#e7e2d9] text-[#615e57]'}`}>
                      {currentStep === 1 ? '1' : <FormIcon type="check" />}
                    </span>
                    <span className={`mt-3 text-sm font-semibold ${currentStep === 1 ? 'text-[--accent]' : 'text-[rgba(97,94,87,0.55)]'}`}>Informacion personal</span>
                  </div>
                  <span className="mt-5 h-px bg-[rgba(217,193,196,0.7)]" />
                  <div className="flex flex-col items-center text-center">
                    <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${currentStep === 2 ? 'bg-[--accent] text-white shadow-[0_10px_20px_rgba(94,22,44,0.16)]' : 'bg-[#eddfdf] text-[--fg-2]'}`}>2</span>
                    <span className={`mt-3 text-sm font-semibold ${currentStep === 2 ? 'text-[--accent]' : 'text-[--fg-2]'}`}>Informacion del negocio</span>
                  </div>
                </div>
              </nav>

              <section className={sectionVisibility(currentStep === 1)} aria-labelledby="personal-title">
                <h2 id="personal-title" className="font-[var(--font-display)] text-3xl font-medium leading-tight text-[--fg] md:text-4xl">
                  Cuentanos sobre ti
                </h2>
                <p className="mt-3 text-base leading-7 text-[--fg-2]">
                  Esta informacion es necesaria para verificar tu identidad como miembra de la comunidad SW.
                </p>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="full_name">Nombre completo</FieldLabel>
                    <IconInput icon="user">
                      <input id="full_name" name="full_name" required placeholder="Escribe tu nombre completo" className={iconInputClass} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel htmlFor="cedula">Numero de cedula</FieldLabel>
                    <IconInput icon="badge">
                      <input id="cedula" name="cedula" required minLength={6} maxLength={12} inputMode="numeric" placeholder="Escribe tu numero de cedula" className={iconInputClass} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel htmlFor="email">Correo electronico</FieldLabel>
                    <IconInput icon="mail">
                      <input id="email" name="email" required type="email" placeholder="ejemplo@correo.com" className={iconInputClass} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel htmlFor="phone">Telefono / WhatsApp</FieldLabel>
                    <IconInput icon="phone">
                      <input id="phone" name="phone" required placeholder="+573001234567" className={iconInputClass} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel htmlFor="fb_profile_url">Perfil de Facebook</FieldLabel>
                    <IconInput icon="link">
                      <input id="fb_profile_url" name="fb_profile_url" required type="url" placeholder="https://facebook.com/tu-perfil" className={iconInputClass} />
                    </IconInput>
                  </div>
                </div>

                <label className="mt-7 flex items-start gap-3 text-sm leading-6 text-[--fg-2]">
                  <input name="consent_accepted" type="checkbox" required className="mt-1 h-5 w-5 rounded border-[rgba(217,193,196,0.9)] text-[--accent] accent-[--accent]" />
                  <span>Acepto que SW Mujeres revise mi informacion para evaluar la solicitud de ingreso al directorio.</span>
                </label>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <Link href="/directorio" className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[--accent] px-6 text-base font-bold text-[--accent] transition hover:bg-[#fff0f0] focus:outline-none focus:ring-2 focus:ring-[rgba(126,55,78,0.2)]">
                    Cancelar
                  </Link>
                  <button type="button" onClick={goToBusinessStep} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[--accent] px-6 text-base font-bold text-white shadow-[0_14px_28px_rgba(94,22,44,0.18)] transition hover:bg-[--accent-hover] focus:outline-none focus:ring-2 focus:ring-[rgba(126,55,78,0.22)]">
                    Continuar <FormIcon type="arrow" />
                  </button>
                </div>
              </section>

              <section className={sectionVisibility(currentStep === 2)} aria-labelledby="business-title">
                <h2 id="business-title" className="font-[var(--font-display)] text-3xl font-medium leading-tight text-[--fg] md:text-4xl">
                  Cuentanos sobre tu negocio
                </h2>
                <p className="mt-3 text-base leading-7 text-[--fg-2]">
                  Esta informacion sera la base de tu perfil publico en el directorio.
                </p>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="business_name">Nombre del negocio</FieldLabel>
                    <IconInput icon="store">
                      <input id="business_name" name="business_name" required placeholder="Ej: Cafe Luna" className={iconInputClass} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel htmlFor="category">Categoria</FieldLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[--fg-2]"><FormIcon type="category" /></span>
                      <select id="category" name="category" required className={`${iconInputClass} appearance-none pr-12`}>
                        <option value="">Selecciona una categoria</option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[--fg-2]"><ChevronDownIcon size={20} /></span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="description">Descripcion del negocio</FieldLabel>
                    <textarea
                      id="description"
                      name="description"
                      required
                      minLength={10}
                      maxLength={300}
                      rows={4}
                      value={description}
                      onChange={(event) => handleDescriptionChange(event.target.value)}
                      placeholder="Describe brevemente que haces y que te hace unica..."
                      className={`${inputClass} min-h-32 resize-none`}
                    />
                    <input type="hidden" name="description_editorial_status" value={editorialReview.status} />
                    <input type="hidden" name="description_review_id" value={editorialReview.reviewId} />
                    <div className="mt-3">
                      <DescriptionReviewPanel
                        description={description}
                        source="user_form"
                        onResult={handleReviewResult}
                        onAccept={handleReviewAccept}
                        onDismiss={() => setEditorialReview({ status: 'requiere_revision_manual', reviewId: '' })}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border-2 border-dashed border-[rgba(217,193,196,0.95)] bg-[#fff8f7] p-6 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f9ebea] text-[--accent]"><FormIcon type="upload" /></span>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <label className="block text-left">
                      <FieldLabel htmlFor="receipt">Comprobante opcional</FieldLabel>
                      <input id="receipt" name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className={inputClass} />
                    </label>
                    <label className="block text-left">
                      <FieldLabel htmlFor="post_screenshot">Captura del post opcional</FieldLabel>
                      <input id="post_screenshot" name="post_screenshot" type="file" accept="image/*" className={inputClass} />
                    </label>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  <div>
                    <FieldLabel htmlFor="business_phone">WhatsApp</FieldLabel>
                    <IconInput icon="phone">
                      <input id="business_phone" name="business_phone" required placeholder="+573001234567" className={iconInputClass} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel htmlFor="instagram_handle">Instagram</FieldLabel>
                    <IconInput icon="instagram">
                      <input id="instagram_handle" name="instagram_handle" placeholder="@usuario" className={iconInputClass} />
                    </IconInput>
                  </div>
                  <div>
                    <FieldLabel htmlFor="website_url">Website</FieldLabel>
                    <IconInput icon="globe">
                      <input id="website_url" name="website_url" type="url" placeholder="https://..." className={iconInputClass} />
                    </IconInput>
                  </div>
                  <div className="md:col-span-3">
                    <FieldLabel htmlFor="other_socials">Otras redes</FieldLabel>
                    <IconInput icon="link">
                      <input id="other_socials" name="other_socials" placeholder="TikTok, catalogo u otro enlace relevante" className={iconInputClass} />
                    </IconInput>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-[rgba(255,222,164,0.18)] p-5">
                  <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-[--fg]">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 rounded border-[rgba(217,193,196,0.9)] accent-[--accent]"
                      checked={offersDiscount}
                      onChange={(event) => setOffersDiscount(event.target.checked)}
                    />
                    <span>Ofreces descuento para la comunidad SW?</span>
                  </label>
                  {offersDiscount && (
                    <textarea id="discount_details" name="discount_details" rows={3} required className={`${inputClass} mt-4 resize-none`} placeholder="Describe el beneficio que ofreces." />
                  )}
                </div>

                <div className="mt-6">
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

                {submitState.message && (
                  <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                    submitState.status === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}>
                    {submitState.message}
                  </div>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-[auto_1fr]">
                  <button type="button" onClick={() => setCurrentStep(1)} className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[--accent] px-10 text-base font-bold text-[--accent] transition hover:bg-[#fff0f0] focus:outline-none focus:ring-2 focus:ring-[rgba(126,55,78,0.2)]">
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={submitState.status === 'submitting' || productsLoading || products.length === 0}
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[--accent] px-6 text-base font-bold text-white shadow-[0_14px_28px_rgba(94,22,44,0.18)] transition hover:bg-[--accent-hover] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitState.status === 'submitting' ? 'Enviando...' : 'Enviar solicitud'} <FormIcon type="arrow" />
                  </button>
                </div>
              </section>

              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[rgba(84,66,69,0.65)]">
                <FormIcon type="lock" />
                <span>Proceso 100% seguro y confidencial</span>
              </div>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}
