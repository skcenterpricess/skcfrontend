import { httpClient } from '@/shared/api/httpClient'
import type { ManagedUser, OnboardUserPayload, PaginationMeta, UsersListResponse } from '@/shared/types/userManagement'

interface QueryOptions {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  refresh?: boolean
}

export const userManagementService = {
  async list(options: QueryOptions = {}) {
    const params = new URLSearchParams()

    if (options.page) params.set('page', String(options.page))
    if (options.limit) params.set('limit', String(options.limit))
    if (options.search) params.set('search', options.search)
    if (options.isActive !== undefined) params.set('isActive', String(options.isActive))
    if (options.sortBy) params.set('sortBy', options.sortBy)
    if (options.sortOrder) params.set('sortOrder', options.sortOrder)
    if (options.refresh) params.set('refresh', 'true')

    const query = params.toString()
    const response = await httpClient.get<{ data: UsersListResponse; pagination: PaginationMeta }>(
      `/users${query ? `?${query}` : ''}`,
    )

    return {
      records: response.data.data.users,
      pagination: response.data.pagination,
    }
  },

  async create(payload: OnboardUserPayload): Promise<ManagedUser> {
    const response = await httpClient.post<{ data: { user: ManagedUser } }>('/users', payload)
    return response.data.data.user
  },

  async update(id: string, payload: Partial<OnboardUserPayload & { isActive: boolean }>): Promise<ManagedUser> {
    const response = await httpClient.put<{ data: { user: ManagedUser } }>(`/users/${id}`, payload)
    return response.data.data.user
  },
}
