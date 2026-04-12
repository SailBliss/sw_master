'use client'

import { useEffect, useState } from 'react'
import { supabasePublic } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/utils'
import type {
  ApplicationFormStep1,
  ApplicationFormStep2,
  ApplicationFormStep3,
  ProductOption,
} from '@/lib/types'

// ─── Error shape types ────────────────────────────────────────────────────────

type Step1Errors = Partial<Record<keyof ApplicationFormStep1, string>>

type Step2Fields = keyof Omit<ApplicationFormStep2, 'directory_image'> | 'discount_details'
type Step2Errors = Partial<Record<Step2Fields, string>>

type Step3Errors = {
  product_id?: string
  receipt?: string
  consent_accepted?: string
}

// ─── Step 2 local state (no file upload — directory_image handled separately) ─

type Step2State = {
  business_name: string
  description: string
  category: string
  business_phone: string
  instagram_handle: string
  website_url: string
  other_socials: string
  offers_discount: boolean
  discount_details: string
}

// ─── Step 3 local state ───────────────────────────────────────────────────────

type Step3State = {
  product_id: string
  receipt: File | null
  post_screenshot: File | null
  consent_accepted: boolean
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const baseInput =
  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-colors'
const normalBorder = 'border-gray-300'
const errorBorder = 'border-red-400'

function inputClass(hasError: boolean): string {
  return `${baseInput} ${hasError ? errorBorder : normalBorder}`
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-500 -mt-0.5">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}

// ─── Progress indicator ───────────────────────────────────────────────────────

const STEP_LABELS = ['Datos personales', 'Tu negocio', 'Plan y envío']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8 gap-0">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const isDone = step < current
        const isActive = step === current

        return (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-10 sm:w-16 h-0.5 ${
                  step <= current ? 'bg-violet-500' : 'bg-gray-200'
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                  isDone
                    ? 'bg-violet-500 border-violet-500 text-white'
                    : isActive
                    ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isDone ? '✓' : step}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  isActive ? 'text-violet-700 font-medium' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1 — Datos personales ────────────────────────────────────────────────

function Step1Form({
  data,
  errors,
  onChange,
}: {
  data: ApplicationFormStep1
  errors: Step1Errors
  onChange: (field: keyof ApplicationFormStep1, value: string) => void
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Datos personales</h2>

      <Field label="Cédula" error={errors.cedula}>
        <input
          type="text"
          value={data.cedula}
          onChange={(e) => onChange('cedula', e.target.value)}
          className={inputClass(!!errors.cedula)}
          placeholder="1234567890"
          inputMode="numeric"
        />
      </Field>

      <Field label="Nombre completo" error={errors.full_name}>
        <input
          type="text"
          value={data.full_name}
          onChange={(e) => onChange('full_name', e.target.value)}
          className={inputClass(!!errors.full_name)}
          placeholder="Tu nombre completo"
        />
      </Field>

      <Field label="Correo electrónico" error={errors.email}>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={inputClass(!!errors.email)}
          placeholder="tu@email.com"
        />
      </Field>

      <Field label="Teléfono personal" error={errors.phone}>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className={inputClass(!!errors.phone)}
          placeholder="300 000 0000"
          inputMode="tel"
        />
      </Field>

      <Field label="URL de tu perfil de Facebook" error={errors.fb_profile_url}>
        <input
          type="url"
          value={data.fb_profile_url}
          onChange={(e) => onChange('fb_profile_url', e.target.value)}
          className={inputClass(!!errors.fb_profile_url)}
          placeholder="https://facebook.com/tu.perfil"
        />
      </Field>
    </div>
  )
}

// ─── Step 2 — Datos del negocio ───────────────────────────────────────────────

function Step2Form({
  data,
  errors,
  onChange,
}: {
  data: Step2State
  errors: Step2Errors
  onChange: (field: keyof Step2State, value: string | boolean) => void
}) {
  const descLen = data.description.length
  const descOver = descLen > 300

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Tu negocio</h2>

      <Field label="Nombre del negocio" error={errors.business_name}>
        <input
          type="text"
          value={data.business_name}
          onChange={(e) => onChange('business_name', e.target.value)}
          className={inputClass(!!errors.business_name)}
          placeholder="Mi Emprendimiento"
        />
      </Field>

      <Field label="Categoría" error={errors.category}>
        <select
          value={data.category}
          onChange={(e) => onChange('category', e.target.value)}
          className={inputClass(!!errors.category)}
        >
          <option value="">Selecciona una categoría</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Descripción" error={errors.description}>
        <div className="relative">
          <textarea
            value={data.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={4}
            className={`${inputClass(!!errors.description || descOver)} resize-none`}
            placeholder="Cuéntanos qué ofreces..."
          />
          <span
            className={`absolute bottom-2 right-3 text-xs ${
              descOver ? 'text-red-500 font-medium' : 'text-gray-400'
            }`}
          >
            {descLen} / 300
          </span>
        </div>
      </Field>

      <Field
        label="WhatsApp del negocio"
        hint="Incluye el código de país: 57300..."
        error={errors.business_phone}
      >
        <input
          type="tel"
          value={data.business_phone}
          onChange={(e) => onChange('business_phone', e.target.value)}
          className={inputClass(!!errors.business_phone)}
          placeholder="57300..."
          inputMode="tel"
        />
      </Field>

      <Field label="Instagram (opcional)" error={errors.instagram_handle}>
        <input
          type="text"
          value={data.instagram_handle}
          onChange={(e) => onChange('instagram_handle', e.target.value)}
          className={inputClass(!!errors.instagram_handle)}
          placeholder="@mi.negocio"
        />
      </Field>

      <Field label="Sitio web (opcional)" error={errors.website_url}>
        <input
          type="url"
          value={data.website_url}
          onChange={(e) => onChange('website_url', e.target.value)}
          className={inputClass(!!errors.website_url)}
          placeholder="https://minegocio.com"
        />
      </Field>

      <Field label="Otras redes (opcional)" error={errors.other_socials}>
        <input
          type="text"
          value={data.other_socials}
          onChange={(e) => onChange('other_socials', e.target.value)}
          className={inputClass(!!errors.other_socials)}
          placeholder="TikTok, Twitter, etc."
        />
      </Field>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          ¿Ofreces descuento especial a miembras SW?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange('offers_discount', true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
              data.offers_discount
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'bg-white border-gray-300 text-gray-600 hover:border-violet-300'
            }`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => onChange('offers_discount', false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
              !data.offers_discount
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'bg-white border-gray-300 text-gray-600 hover:border-violet-300'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {data.offers_discount && (
        <Field label="Detalle del descuento" error={errors.discount_details}>
          <input
            type="text"
            value={data.discount_details}
            onChange={(e) => onChange('discount_details', e.target.value)}
            className={inputClass(!!errors.discount_details)}
            placeholder="Ej: 10% en primera compra para miembras SW"
          />
        </Field>
      )}
    </div>
  )
}

// ─── Step 3 — Plan y pago ─────────────────────────────────────────────────────

function Step3Form({
  data,
  errors,
  products,
  productsLoading,
  productsError,
  selectedProduct,
  onChange,
}: {
  data: Step3State
  errors: Step3Errors
  products: ProductOption[]
  productsLoading: boolean
  productsError: string | null
  selectedProduct: ProductOption | null
  onChange: (field: keyof Step3State, value: string | File | null | boolean) => void
}) {
  const isPaid = selectedProduct !== null && selectedProduct.price_cop > 0

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Plan y envío</h2>

      {/* Plan selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Plan de membresía</label>

        {productsLoading && (
          <p className="text-sm text-gray-500">Cargando planes disponibles...</p>
        )}

        {productsError && (
          <p className="text-sm text-red-600">{productsError}</p>
        )}

        {!productsLoading && !productsError && products.length === 0 && (
          <p className="text-sm text-gray-500">No hay planes disponibles en este momento.</p>
        )}

        {!productsLoading && !productsError && products.length > 0 && (
          <div className="flex flex-col gap-2">
            {products.map((product) => {
              const isSelected = data.product_id === product.id
              const priceLabel =
                product.price_cop === 0 ? 'Gratuito' : `$${product.price_cop.toLocaleString('es-CO')} COP`
              const durationLabel =
                product.duration_days !== null ? ` · ${product.duration_days} días` : ''

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onChange('product_id', product.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 bg-white hover:border-violet-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800">{product.name}</span>
                    <span
                      className={`text-sm font-semibold ${
                        product.price_cop === 0 ? 'text-violet-600' : 'text-gray-800'
                      }`}
                    >
                      {priceLabel}
                      <span className="font-normal text-gray-400">{durationLabel}</span>
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {errors.product_id && (
          <p className="text-xs text-red-600">{errors.product_id}</p>
        )}
      </div>

      {/* Payment instructions — only for paid plans */}
      {isPaid && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Una vez seleccionado tu plan, realiza el pago y adjunta el comprobante a continuación.
        </div>
      )}

      {/* Receipt upload */}
      <Field
        label={isPaid ? 'Comprobante de pago' : 'Comprobante de pago (opcional)'}
        error={errors.receipt}
      >
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => onChange('receipt', e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
        />
        {data.receipt && (
          <p className="text-xs text-gray-500 mt-1">
            Archivo seleccionado: {data.receipt.name}
          </p>
        )}
      </Field>

      {/* Post screenshot */}
      <Field label="Captura de tu publicación en el grupo SW (opcional)">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange('post_screenshot', e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
        />
        {data.post_screenshot && (
          <p className="text-xs text-gray-500 mt-1">
            Archivo seleccionado: {data.post_screenshot.name}
          </p>
        )}
      </Field>

      {/* Consent checkbox */}
      <div className="flex flex-col gap-1">
        <label
          className={`flex items-start gap-3 cursor-pointer group ${
            errors.consent_accepted ? 'text-red-700' : 'text-gray-700'
          }`}
        >
          <input
            type="checkbox"
            checked={data.consent_accepted}
            onChange={(e) => onChange('consent_accepted', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-violet-600 shrink-0"
          />
          <span className="text-sm leading-snug">
            Acepto los términos de uso y autorizo a SW Mujeres a publicar mi información en el
            directorio.
          </span>
        </label>
        {errors.consent_accepted && (
          <p className="text-xs text-red-600 ml-7">{errors.consent_accepted}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InscripcionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1
  const [step1, setStep1] = useState<ApplicationFormStep1>({
    cedula: '',
    full_name: '',
    email: '',
    phone: '',
    fb_profile_url: '',
  })
  const [errors1, setErrors1] = useState<Step1Errors>({})

  // Step 2
  const [step2, setStep2] = useState<Step2State>({
    business_name: '',
    description: '',
    category: '',
    business_phone: '',
    instagram_handle: '',
    website_url: '',
    other_socials: '',
    offers_discount: false,
    discount_details: '',
  })
  const [errors2, setErrors2] = useState<Step2Errors>({})

  // Step 3
  const [step3, setStep3] = useState<Step3State>({
    product_id: '',
    receipt: null,
    post_screenshot: null,
    consent_accepted: false,
  })
  const [errors3, setErrors3] = useState<Step3Errors>({})

  // Products
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  // Load products once on mount
  useEffect(() => {
    async function loadProducts() {
      setProductsLoading(true)
      setProductsError(null)

      const { data, error } = await supabasePublic
        .from('products')
        .select('id, name, price_cop, duration_days')
        .eq('is_active', true)

      if (error) {
        setProductsError('No se pudieron cargar los planes disponibles. Recarga la página.')
        setProductsLoading(false)
        return
      }

      const opts = (data ?? []) as ProductOption[]
      setProducts(opts)

      // Pre-select when there is exactly one option
      if (opts.length === 1) {
        setStep3((prev) => ({ ...prev, product_id: opts[0].id }))
      }

      setProductsLoading(false)
    }

    loadProducts()
  }, [])

  const selectedProduct = products.find((p) => p.id === step3.product_id) ?? null

  // ─── Validation ─────────────────────────────────────────────────────────────

  function validateStep1(): boolean {
    const errs: Step1Errors = {}
    if (!step1.cedula.trim()) errs.cedula = 'La cédula es obligatoria.'
    if (!step1.full_name.trim()) errs.full_name = 'El nombre completo es obligatorio.'
    if (!step1.email.trim()) errs.email = 'El correo electrónico es obligatorio.'
    if (!step1.phone.trim()) errs.phone = 'El teléfono personal es obligatorio.'
    if (!step1.fb_profile_url.trim()) errs.fb_profile_url = 'La URL de tu perfil de Facebook es obligatoria.'
    setErrors1(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): boolean {
    const errs: Step2Errors = {}
    if (!step2.business_name.trim()) errs.business_name = 'El nombre del negocio es obligatorio.'
    if (!step2.category) errs.category = 'Selecciona una categoría.'
    if (!step2.description.trim()) errs.description = 'La descripción es obligatoria.'
    else if (step2.description.length > 300)
      errs.description = 'La descripción no puede superar 300 caracteres.'
    if (!step2.business_phone.trim()) errs.business_phone = 'El WhatsApp del negocio es obligatorio.'
    if (step2.offers_discount && !step2.discount_details.trim())
      errs.discount_details = 'Describe el descuento que ofreces.'
    setErrors2(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep3(): boolean {
    const errs: Step3Errors = {}
    if (!step3.product_id) errs.product_id = 'Selecciona un plan.'
    const isPaid = selectedProduct !== null && selectedProduct.price_cop > 0
    if (isPaid && !step3.receipt) errs.receipt = 'El comprobante de pago es obligatorio.'
    if (!step3.consent_accepted) errs.consent_accepted = 'Debes aceptar los términos para continuar.'
    setErrors3(errs)
    return Object.keys(errs).length === 0
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  function handleNext() {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep3()) return

    setSubmitting(true)
    setSubmitError(null)

    const fd = new FormData()

    // Step 1 fields
    fd.append('cedula', step1.cedula.trim())
    fd.append('full_name', step1.full_name.trim())
    fd.append('email', step1.email.trim())
    fd.append('phone', step1.phone.trim())
    fd.append('fb_profile_url', step1.fb_profile_url.trim())

    // Step 2 fields
    fd.append('business_name', step2.business_name.trim())
    fd.append('description', step2.description.trim())
    fd.append('category', step2.category)
    fd.append('business_phone', step2.business_phone.trim())
    fd.append('offers_discount', String(step2.offers_discount))
    if (step2.instagram_handle.trim()) fd.append('instagram_handle', step2.instagram_handle.trim())
    if (step2.website_url.trim()) fd.append('website_url', step2.website_url.trim())
    if (step2.other_socials.trim()) fd.append('other_socials', step2.other_socials.trim())
    if (step2.offers_discount && step2.discount_details.trim()) {
      fd.append('discount_details', step2.discount_details.trim())
    }

    // Step 3 fields
    fd.append('product_id', step3.product_id)
    fd.append('consent_accepted', 'true')
    if (step3.receipt) fd.append('receipt', step3.receipt)
    if (step3.post_screenshot) fd.append('post_screenshot', step3.post_screenshot)

    try {
      const res = await fetch('/api/solicitudes', { method: 'POST', body: fd })
      const json = (await res.json()) as { success: boolean; message: string }

      if (json.success) {
        setSubmitted(true)
      } else {
        setSubmitError(json.message ?? 'Ocurrió un error. Intenta de nuevo.')
      }
    } catch {
      setSubmitError('Error de conexión. Revisa tu internet e intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Confirmation screen ──────────────────────────────────────────────────────

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900">¡Solicitud recibida!</h1>
          <p className="text-gray-600 leading-relaxed">
            Revisaremos tu información y te contactaremos en los próximos días. Estamos emocionadas
            de conocer tu emprendimiento.
          </p>
        </div>
      </main>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-[600px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inscríbete al directorio</h1>
          <p className="text-gray-500 text-sm mt-1">
            Comparte tu emprendimiento con la comunidad SW Mujeres
          </p>
        </div>

        <StepIndicator current={currentStep} />

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          {currentStep === 1 && (
            <Step1Form
              data={step1}
              errors={errors1}
              onChange={(field, value) => {
                setStep1((prev) => ({ ...prev, [field]: value }))
                if (errors1[field]) setErrors1((prev) => ({ ...prev, [field]: undefined }))
              }}
            />
          )}

          {currentStep === 2 && (
            <Step2Form
              data={step2}
              errors={errors2}
              onChange={(field, value) => {
                setStep2((prev) => ({ ...prev, [field]: value }))
                const key = field as Step2Fields
                if (errors2[key]) setErrors2((prev) => ({ ...prev, [key]: undefined }))
              }}
            />
          )}

          {currentStep === 3 && (
            <Step3Form
              data={step3}
              errors={errors3}
              products={products}
              productsLoading={productsLoading}
              productsError={productsError}
              selectedProduct={selectedProduct}
              onChange={(field, value) => {
                setStep3((prev) => ({ ...prev, [field]: value }))
                const key = field as keyof Step3Errors
                if (errors3[key]) setErrors3((prev) => ({ ...prev, [key]: undefined }))
              }}
            />
          )}

          {/* Navigation */}
          <div className={`flex mt-8 ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                ← Volver
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
              >
                Continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || productsLoading}
                className="px-6 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            )}
          </div>

          {submitError && (
            <p className="mt-4 text-sm text-red-600 text-center">{submitError}</p>
          )}
        </div>
      </div>
    </main>
  )
}
