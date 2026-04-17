import { insertView, insertClick, getStatsByToken } from '../repository/tracking.repository'
import type { ContactClickType, ProfileStats } from '../types'

export const trackingService = {
  async recordView(profileId: string): Promise<void> {
    return insertView(profileId)
  },

  async recordClick(profileId: string, type: ContactClickType): Promise<void> {
    return insertClick(profileId, type)
  },

  async getStats(token: string): Promise<ProfileStats | null> {
    return getStatsByToken(token)
  },
}
