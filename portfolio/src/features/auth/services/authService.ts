import { httpClient } from '@/shared/api/httpClient'
import type { AuthUser, LoginPayload } from '@/shared/types/auth'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const response = await httpClient.post<{ user: AuthUser }>('/auth/login', payload)
    return response.data.user
  },

  async refresh(): Promise<void> {
    await httpClient.post('/auth/refresh')
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  },

  async me(): Promise<AuthUser> {
    const response = await httpClient.get<{ user: AuthUser }>('/auth/me')
    return response.data.user
  },
}
