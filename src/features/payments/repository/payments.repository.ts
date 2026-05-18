import { supabaseAdmin } from '@src/shared/lib/supabase-admin'
import type {
  PaymentApplicationContext,
  PaymentApplicationStatus,
  PaymentProvider,
  PaymentTransaction,
  PaymentTransactionStatus,
  PublicPaymentStatus,
} from '../types'

function one<T>(raw: T | T[] | null | undefined): T | null {
  if (raw === null || raw === undefined) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

type RawApplicationPayment = {
  id: string
  status: PaymentApplicationStatus
  entrepreneur_id: string
  product_id: string
  amount_cop: number
  entrepreneurs: {
    email: string | null
    full_name: string | null
  } | {
    email: string | null
    full_name: string | null
  }[] | null
  products: {
    name: string
    price_cop: number
    duration_days: number | null
  } | {
    name: string
    price_cop: number
    duration_days: number | null
  }[] | null
}

export async function getApplicationPaymentContext(applicationId: string): Promise<PaymentApplicationContext | null> {
  const { data: app, error } = await supabaseAdmin
    .from('applications')
    .select(`
      id, status, entrepreneur_id, product_id, amount_cop,
      entrepreneurs ( email, full_name ),
      products ( name, price_cop, duration_days )
    `)
    .eq('id', applicationId)
    .maybeSingle<RawApplicationPayment>()

  if (error) throw new Error(`Error al leer solicitud para pago: ${error.message}`)
  if (!app) return null

  const entrepreneur = one(app.entrepreneurs)
  const product = one(app.products)
  if (!product) throw new Error(`Producto no encontrado para solicitud ${applicationId}`)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('business_profiles')
    .select('business_name')
    .eq('entrepreneur_id', app.entrepreneur_id)
    .maybeSingle<{ business_name: string | null }>()

  if (profileError) throw new Error(`Error al leer perfil para pago: ${profileError.message}`)

  return {
    applicationId: app.id,
    applicationStatus: app.status,
    entrepreneurId: app.entrepreneur_id,
    productId: app.product_id,
    amountCop: app.amount_cop || product.price_cop,
    productName: product.name,
    durationDays: product.duration_days,
    entrepreneurEmail: entrepreneur?.email ?? null,
    entrepreneurName: entrepreneur?.full_name ?? null,
    businessName: profile?.business_name ?? null,
  }
}

export async function invalidateActivePaymentIntent(applicationId: string): Promise<void> {
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin
    .from('payment_transactions')
    .update({ status: 'invalidated', invalidated_at: now, updated_at: now })
    .eq('application_id', applicationId)
    .eq('provider', 'wompi')
    .eq('status', 'pending')
    .is('invalidated_at', null)

  if (error) throw new Error(`Error al invalidar pago anterior: ${error.message}`)
}

export async function insertPaymentIntent(params: {
  applicationId: string
  entrepreneurId: string
  productId: string
  provider: PaymentProvider
  providerReference: string
  amountCop: number
  currency: string
  expiresAt: string
}): Promise<PaymentTransaction> {
  const { data, error } = await supabaseAdmin
    .from('payment_transactions')
    .insert({
      application_id: params.applicationId,
      entrepreneur_id: params.entrepreneurId,
      product_id: params.productId,
      provider: params.provider,
      provider_reference: params.providerReference,
      status: 'pending',
      amount_cop: params.amountCop,
      currency: params.currency,
      checkout_url: null,
      expires_at: params.expiresAt,
    })
    .select('*')
    .single<PaymentTransaction>()

  if (error || !data) throw new Error(`Error al crear intencion de pago: ${error?.message ?? 'sin datos'}`)
  return data
}

export async function setPaymentCheckoutUrl(paymentTransactionId: string, checkoutUrl: string): Promise<PaymentTransaction> {
  const { data, error } = await supabaseAdmin
    .from('payment_transactions')
    .update({ checkout_url: checkoutUrl, updated_at: new Date().toISOString() })
    .eq('id', paymentTransactionId)
    .select('*')
    .single<PaymentTransaction>()

  if (error || !data) throw new Error(`Error al guardar checkout Wompi: ${error?.message ?? 'sin datos'}`)
  return data
}

export async function getPaymentTransactionById(paymentTransactionId: string): Promise<PaymentTransaction | null> {
  const { data, error } = await supabaseAdmin
    .from('payment_transactions')
    .select('*')
    .eq('id', paymentTransactionId)
    .maybeSingle<PaymentTransaction>()

  if (error) throw new Error(`Error al leer intencion de pago: ${error.message}`)
  return data
}

export async function getPaymentTransactionByProviderReference(providerReference: string): Promise<PaymentTransaction | null> {
  const { data, error } = await supabaseAdmin
    .from('payment_transactions')
    .select('*')
    .eq('provider', 'wompi')
    .eq('provider_reference', providerReference)
    .maybeSingle<PaymentTransaction>()

  if (error) throw new Error(`Error al leer transaccion Wompi: ${error.message}`)
  return data
}

export async function updatePaymentTransactionStatus(params: {
  paymentTransactionId: string
  status: PaymentTransactionStatus
  providerTransactionId?: string
  rawProviderPayload?: unknown
}): Promise<void> {
  const update: Record<string, unknown> = {
    status: params.status,
    updated_at: new Date().toISOString(),
  }

  if (params.providerTransactionId !== undefined) {
    update.provider_transaction_id = params.providerTransactionId
  }
  if (params.rawProviderPayload !== undefined) {
    update.raw_provider_payload = params.rawProviderPayload
  }

  const { error } = await supabaseAdmin
    .from('payment_transactions')
    .update(update)
    .eq('id', params.paymentTransactionId)

  if (error) throw new Error(`Error al actualizar transaccion Wompi: ${error.message}`)
}

export async function confirmWompiPayment(params: {
  paymentTransactionId: string
  providerTransactionId: string
  rawProviderPayload: unknown
}): Promise<void> {
  const { error } = await supabaseAdmin.rpc('confirm_wompi_payment', {
    p_payment_transaction_id: params.paymentTransactionId,
    p_provider_transaction_id: params.providerTransactionId,
    p_raw_provider_payload: params.rawProviderPayload,
  })

  if (error) throw new Error(`Error al confirmar pago Wompi: ${error.message}`)
}

export async function getPublicPaymentStatus(paymentTransactionId: string): Promise<PublicPaymentStatus | null> {
  const payment = await getPaymentTransactionById(paymentTransactionId)
  if (!payment) return null

  const { data: app, error } = await supabaseAdmin
    .from('applications')
    .select('status')
    .eq('id', payment.application_id)
    .maybeSingle<{ status: PaymentApplicationStatus }>()

  if (error) throw new Error(`Error al leer estado de solicitud: ${error.message}`)
  if (!app) throw new Error('Solicitud asociada al pago no encontrada.')

  return {
    paymentTransactionId: payment.id,
    paymentStatus: payment.status,
    applicationStatus: app.status,
    expiresAt: payment.expires_at,
  }
}

export async function getStatsTokenByEntrepreneurId(entrepreneurId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('business_profiles')
    .select('stats_token')
    .eq('entrepreneur_id', entrepreneurId)
    .maybeSingle<{ stats_token: string | null }>()

  if (error) throw new Error(`Error al leer token de estadisticas: ${error.message}`)
  return data?.stats_token ?? null
}
