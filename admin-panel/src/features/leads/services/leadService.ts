import { httpClient } from '@/shared/api/httpClient'
import type { Lead, LeadFormPayload, LeadsListResponse, PaginationMeta } from '@/shared/types/lead'

interface QueryOptions {
  page?: number
  limit?: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  refresh?: boolean
}

export const leadService = {
  async list(options: QueryOptions = {}) {
    const params = new URLSearchParams()

    if (options.page) params.set('page', String(options.page))
    if (options.limit) params.set('limit', String(options.limit))
    if (options.search) params.set('search', options.search)
    if (options.status) params.set('status', options.status)
    if (options.sortBy) params.set('sortBy', options.sortBy)
    if (options.sortOrder) params.set('sortOrder', options.sortOrder)
    if (options.refresh) params.set('refresh', 'true')

    const query = params.toString()
    const response = await httpClient.get<{ data: LeadsListResponse; pagination: PaginationMeta }>(
      `/leads${query ? `?${query}` : ''}`,
    )

    return {
      records: response.data.data.leads,
      pagination: response.data.pagination,
    }
  },

  async update(id: string, payload: Partial<LeadFormPayload>): Promise<Lead> {
    const response = await httpClient.put<{ data: { lead: Lead } }>(`/leads/${id}`, payload)
    return response.data.data.lead
  },

  async create(payload: LeadFormPayload): Promise<Lead> {
    const response = await httpClient.post<{ data: { lead: Lead } }>('/leads', payload)
    return response.data.data.lead
  },
}
