export type PaymentProvider = 'wompi'

export type PaymentTransactionStatus =
  | 'pending'
  | 'paid'
  | 'declined'
  | 'failed'
  | 'expired'
  | 'invalidated'
  | 'error'

export type PaymentTransaction = {
  id: string
  application_id: string
  entrepreneur_id: string
  product_id: string
  provider: PaymentProvider
  provider_reference: string
  provider_transaction_id: string | null
  status: PaymentTransactionStatus
  amount_cop: number
  currency: string
  checkout_url: string | null
  raw_provider_payload: unknown | null
  expires_at: string
  invalidated_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export type PaymentApplicationStatus = 'pendiente' | 'habilitado_para_pago' | 'aprobado' | 'rechazado'

export type PaymentApplicationContext = {
  applicationId: string
  applicationStatus: PaymentApplicationStatus
  entrepreneurId: string
  productId: string
  amountCop: number
  productName: string
  durationDays: number | null
  entrepreneurEmail: string | null
  entrepreneurName: string | null
  businessName: string | null
}

export type PaymentIntentResult = {
  paymentTransactionId: string
  checkoutUrl: string
  expiresAt: string
}

export type PublicPaymentStatus = {
  paymentTransactionId: string
  paymentStatus: PaymentTransactionStatus
  applicationStatus: PaymentApplicationStatus
  expiresAt: string
}
