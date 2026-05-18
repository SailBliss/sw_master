import { createHash, randomUUID } from 'crypto'
import { notifyEntrepreneurApproved } from '@src/shared/lib/email'
import {
  confirmWompiPayment,
  getApplicationPaymentContext,
  getPaymentTransactionById,
  getPaymentTransactionByProviderReference,
  getPublicPaymentStatus,
  getStatsTokenByEntrepreneurId,
  insertPaymentIntent,
  invalidateActivePaymentIntent,
  setPaymentCheckoutUrl,
  updatePaymentTransactionStatus,
} from '../repository/payments.repository'
import type { PaymentIntentResult, PaymentTransactionStatus, PublicPaymentStatus } from '../types'

const PROVIDER = 'wompi'
const CURRENCY = 'COP'
const PAYMENT_EXPIRATION_DAYS = 7

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!siteUrl) throw new Error('NEXT_PUBLIC_SITE_URL no esta configurada.')
  return siteUrl.replace(/\/$/, '')
}

function assertCheckoutConfig(): void {
  getSiteUrl()
  if (!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.trim()) {
    throw new Error('NEXT_PUBLIC_WOMPI_PUBLIC_KEY no esta configurada.')
  }
}

function addDaysIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function getByPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return (value as Record<string, unknown>)[key]
    }
    return undefined
  }, source)
}

function normalizeProviderStatus(status: string): PaymentTransactionStatus {
  const normalized = status.toUpperCase()
  if (normalized === 'APPROVED') return 'paid'
  if (normalized === 'DECLINED') return 'declined'
  if (normalized === 'VOIDED') return 'expired'
  if (normalized === 'ERROR') return 'failed'
  return 'pending'
}

function assertValidCheckoutUrl(paymentTransactionId: string, checkoutUrl: string | null): string {
  if (!checkoutUrl) {
    throw new Error(`La intencion de pago ${paymentTransactionId} no tiene checkout Wompi.`)
  }
  return checkoutUrl
}

export function buildWompiCheckoutUrl(params: {
  paymentTransactionId: string
  providerReference: string
  amountCop: number
}): string {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.trim()
  if (!publicKey) throw new Error('NEXT_PUBLIC_WOMPI_PUBLIC_KEY no esta configurada.')

  const amountInCents = params.amountCop * 100
  const redirectUrl = `${getSiteUrl()}/inscripcion/confirmacion?paymentTransactionId=${encodeURIComponent(params.paymentTransactionId)}`

  const url = new URL('https://checkout.wompi.co/p/')
  url.searchParams.set('public-key', publicKey)
  url.searchParams.set('currency', CURRENCY)
  url.searchParams.set('amount-in-cents', String(amountInCents))
  url.searchParams.set('reference', params.providerReference)
  url.searchParams.set('redirect-url', redirectUrl)

  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET?.trim()
  if (integritySecret) {
    url.searchParams.set(
      'signature:integrity',
      sha256(`${params.providerReference}${amountInCents}${CURRENCY}${integritySecret}`)
    )
  }

  return url.toString()
}

export async function createWompiPaymentIntentForApplication(applicationId: string): Promise<PaymentIntentResult & {
  entrepreneurEmail: string | null
  entrepreneurName: string | null
  businessName: string | null
}> {
  const context = await getApplicationPaymentContext(applicationId)
  if (!context) throw new Error('Solicitud no encontrada.')
  if (context.applicationStatus !== 'habilitado_para_pago') {
    throw new Error('La solicitud no esta habilitada para pago.')
  }
  if (!Number.isInteger(context.amountCop) || context.amountCop <= 0) {
    throw new Error('La solicitud no tiene un valor valido para pago Wompi.')
  }

  assertCheckoutConfig()
  await invalidateActivePaymentIntent(applicationId)

  const payment = await insertPaymentIntent({
    applicationId,
    entrepreneurId: context.entrepreneurId,
    productId: context.productId,
    provider: PROVIDER,
    providerReference: `sw-${randomUUID()}`,
    amountCop: context.amountCop,
    currency: CURRENCY,
    expiresAt: addDaysIso(PAYMENT_EXPIRATION_DAYS),
  })

  const checkoutUrl = buildWompiCheckoutUrl({
    paymentTransactionId: payment.id,
    providerReference: payment.provider_reference,
    amountCop: payment.amount_cop,
  })
  const updatedPayment = await setPaymentCheckoutUrl(payment.id, checkoutUrl)

  return {
    paymentTransactionId: updatedPayment.id,
    checkoutUrl: assertValidCheckoutUrl(updatedPayment.id, updatedPayment.checkout_url),
    expiresAt: updatedPayment.expires_at,
    entrepreneurEmail: context.entrepreneurEmail,
    entrepreneurName: context.entrepreneurName,
    businessName: context.businessName,
  }
}

export async function getCheckoutForPaymentTransaction(paymentTransactionId: string): Promise<PaymentIntentResult> {
  const payment = await getPaymentTransactionById(paymentTransactionId)
  if (!payment) throw new Error('Intencion de pago no encontrada.')
  if (payment.provider !== PROVIDER) throw new Error('La intencion de pago no pertenece a Wompi.')
  if (payment.status !== 'pending') throw new Error('La intencion de pago ya no esta pendiente.')
  if (payment.invalidated_at) throw new Error('La intencion de pago fue reemplazada por un link nuevo.')
  if (new Date(payment.expires_at).getTime() <= Date.now()) {
    throw new Error('La intencion de pago expiro. Solicita un nuevo link.')
  }

  return {
    paymentTransactionId: payment.id,
    checkoutUrl: assertValidCheckoutUrl(payment.id, payment.checkout_url),
    expiresAt: payment.expires_at,
  }
}

export function verifyWompiEventChecksum(body: unknown, headerChecksum: string | null): boolean {
  const eventSecret = process.env.WOMPI_EVENTS_SECRET?.trim()
  if (!eventSecret) throw new Error('WOMPI_EVENTS_SECRET no esta configurada.')

  const event = body as { signature?: { properties?: string[]; checksum?: string }; timestamp?: number; data?: unknown }
  const checksum = headerChecksum || event.signature?.checksum
  if (!event.signature?.properties || typeof event.timestamp !== 'number' || !checksum) return false

  const concatenated = event.signature.properties
    .map((property) => String(getByPath(event.data, property) ?? ''))
    .join('')

  return sha256(`${concatenated}${event.timestamp}${eventSecret}`).toLowerCase() === checksum.toLowerCase()
}

export async function processVerifiedWompiEvent(body: unknown): Promise<{ status: PaymentTransactionStatus; paymentTransactionId?: string }> {
  const transaction = (body as { data?: { transaction?: Record<string, unknown> } }).data?.transaction
  if (!transaction) throw new Error('Evento Wompi sin transaccion.')

  const providerReference = String(transaction.reference ?? '')
  const providerTransactionId = String(transaction.id ?? '')
  const providerStatus = String(transaction.status ?? '')
  const amountInCents = Number(transaction.amount_in_cents)
  const currency = String(transaction.currency ?? CURRENCY)
  const status = normalizeProviderStatus(providerStatus)

  if (!providerReference || !providerTransactionId) {
    throw new Error('Evento Wompi sin referencia o transaction id.')
  }

  const payment = await getPaymentTransactionByProviderReference(providerReference)
  if (!payment) throw new Error('Transaccion interna no encontrada.')
  if (payment.currency !== currency || payment.amount_cop * 100 !== amountInCents) {
    await updatePaymentTransactionStatus({
      paymentTransactionId: payment.id,
      status: 'error',
      providerTransactionId,
      rawProviderPayload: body,
    })
    throw new Error('El pago no coincide con monto o moneda esperados.')
  }

  if (payment.status === 'paid') {
    return { status: 'paid', paymentTransactionId: payment.id }
  }

  if (status !== 'paid') {
    await updatePaymentTransactionStatus({
      paymentTransactionId: payment.id,
      status,
      providerTransactionId,
      rawProviderPayload: body,
    })
    return { status, paymentTransactionId: payment.id }
  }

  await confirmWompiPayment({
    paymentTransactionId: payment.id,
    providerTransactionId,
    rawProviderPayload: body,
  })

  try {
    const context = await getApplicationPaymentContext(payment.application_id)
    const statsToken = await getStatsTokenByEntrepreneurId(payment.entrepreneur_id)
    if (context?.entrepreneurEmail && context.entrepreneurName && context.businessName) {
      await notifyEntrepreneurApproved({
        to: context.entrepreneurEmail,
        entrepreneurName: context.entrepreneurName,
        businessName: context.businessName,
        statsToken: statsToken ?? undefined,
      })
    }
  } catch {
    // Payment confirmation is the source of truth; email failures must not fail webhook acknowledgement.
  }

  return { status: 'paid', paymentTransactionId: payment.id }
}

export async function getWompiPaymentStatus(paymentTransactionId: string): Promise<PublicPaymentStatus> {
  const status = await getPublicPaymentStatus(paymentTransactionId)
  if (!status) throw new Error('Intencion de pago no encontrada.')
  return status
}
