import { httpClient } from '@/shared/api/httpClient'

const LEAD_SESSION_KEY = 'portfolio.lead.session'
const LEAD_SESSION_EVENT = 'lead:session:changed'

export interface LeadAuthUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'lead'
}

export interface LeadRegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

export interface LeadLoginPayload {
  email: string
  password: string
}

export interface LeadProfileUpdatePayload {
  name?: string
  email?: string
  phone?: string
  password?: string
}

export function getStoredLeadSession(): LeadAuthUser | null {
  try {
    const raw = sessionStorage.getItem(LEAD_SESSION_KEY)
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as LeadAuthUser
  } catch {
    return null
  }
}

export function setStoredLeadSession(user: LeadAuthUser): void {
  sessionStorage.setItem(LEAD_SESSION_KEY, JSON.stringify(user))
}

export function clearStoredLeadSession(): void {
  sessionStorage.removeItem(LEAD_SESSION_KEY)
}

export const leadAuthService = {
  async register(payload: LeadRegisterPayload): Promise<LeadAuthUser> {
    const response = await httpClient.post<{ data: { user: LeadAuthUser } }>('/leads/register', payload)
    const user = response.data.data.user
    setStoredLeadSession(user)
    window.dispatchEvent(new CustomEvent(LEAD_SESSION_EVENT))
    return user
  },

  async login(payload: LeadLoginPayload): Promise<LeadAuthUser> {
    const response = await httpClient.post<{ data: { user: LeadAuthUser } }>('/leads/login', payload)
    const user = response.data.data.user
    setStoredLeadSession(user)
    window.dispatchEvent(new CustomEvent(LEAD_SESSION_EVENT))
    return user
  },

  async logout(): Promise<void> {
    await httpClient.post('/leads/logout')
    clearStoredLeadSession()
    window.dispatchEvent(new CustomEvent(LEAD_SESSION_EVENT))
  },

  async me(): Promise<LeadAuthUser> {
    const response = await httpClient.get<{ data: { user: LeadAuthUser } }>('/leads/me')
    const user = response.data.data.user
    setStoredLeadSession(user)
    window.dispatchEvent(new CustomEvent(LEAD_SESSION_EVENT))
    return user
  },

  async updateProfile(payload: LeadProfileUpdatePayload): Promise<LeadAuthUser> {
    const response = await httpClient.put<{ data: { user: LeadAuthUser } }>('/leads/profile', payload)
    const user = response.data.data.user
    setStoredLeadSession(user)
    window.dispatchEvent(new CustomEvent(LEAD_SESSION_EVENT))
    return user
  },
}