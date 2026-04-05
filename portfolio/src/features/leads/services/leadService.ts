import { httpClient } from '@/shared/api/httpClient'

export interface LeadRegistrationPayload {
  name: string
  email: string
  phone: string
  message: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'
}

export const leadService = {
  async register(payload: LeadRegistrationPayload): Promise<void> {
    await httpClient.post('/leads', payload)
  },
}
