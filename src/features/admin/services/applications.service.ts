import {
  listApplications,
  getApplicationById,
  approveApplication,
  enableApplicationForPayment,
  rejectApplication,
} from '../repository/applications.repository'
import { activateMembership } from '../repository/memberships.repository'
import { notifyEntrepreneurApproved, notifyEntrepreneurPaymentAvailable, notifyEntrepreneurRejected } from '@src/shared/lib/email'
import { createWompiPaymentIntentForApplication } from '@src/features/payments/services/wompi.service'
import type { AdminApplication, AdminApplicationStatus } from '../types'

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://swmujeres.com').replace(/\/$/, '')
}

export const applicationsService = {
  async list(status?: AdminApplicationStatus): Promise<AdminApplication[]> {
    return listApplications(status)
  },

  async getById(id: string): Promise<AdminApplication | null> {
    return getApplicationById(id)
  },

  async approve(
    applicationId: string,
    entrepreneurId: string,
    durationDays: number,
    entrepreneurEmail: string,
    entrepreneurName: string,
    businessName: string,
    productPriceCop: number,
    statsToken?: string
  ): Promise<void> {
    if (productPriceCop > 0) {
      await enableApplicationForPayment(applicationId)
      const payment = await createWompiPaymentIntentForApplication(applicationId)
      if (entrepreneurEmail) {
        try {
          await notifyEntrepreneurPaymentAvailable({
            to: entrepreneurEmail,
            entrepreneurName,
            businessName,
            paymentUrl: `${getSiteUrl()}/pago/${payment.paymentTransactionId}`,
            expiresAt: payment.expiresAt,
          })
        } catch {
          // email fails silently
        }
      }
      return
    }

    await approveApplication(applicationId)
    await activateMembership(entrepreneurId, applicationId, durationDays)
    try {
      await notifyEntrepreneurApproved({
        to: entrepreneurEmail,
        entrepreneurName,
        businessName,
        statsToken,
      })
    } catch {
      // email fails silently
    }
  },

  async resendPaymentLink(
    applicationId: string,
    entrepreneurEmail: string,
    entrepreneurName: string,
    businessName: string
  ): Promise<void> {
    const payment = await createWompiPaymentIntentForApplication(applicationId)
    if (!entrepreneurEmail) return

    try {
      await notifyEntrepreneurPaymentAvailable({
        to: entrepreneurEmail,
        entrepreneurName,
        businessName,
        paymentUrl: `${getSiteUrl()}/pago/${payment.paymentTransactionId}`,
        expiresAt: payment.expiresAt,
      })
    } catch {
      // email fails silently
    }
  },

  async reject(
    applicationId: string,
    notes?: string,
    entrepreneurEmail?: string,
    entrepreneurName?: string
  ): Promise<void> {
    await rejectApplication(applicationId, notes)
    if (entrepreneurEmail && entrepreneurName) {
      try {
        await notifyEntrepreneurRejected({
          to: entrepreneurEmail,
          entrepreneurName,
          notes,
        })
      } catch {
        // email fails silently
      }
    }
  },
}
