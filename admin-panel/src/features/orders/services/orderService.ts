import { httpClient } from '@/shared/api/httpClient'
import type {
  Order,
  OrdersListResponse,
  PaginationMeta,
  OrderStatus,
  UpdateOrderStatusPayload,
} from '@/shared/types/order'

interface QueryOptions {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
  city?: string
  createdAfter?: string
  createdBefore?: string
  minTotal?: number
  maxTotal?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'subtotal' | 'status'
  sortOrder?: 'asc' | 'desc'
  refresh?: boolean
}

export const orderService = {
  async list(options: QueryOptions = {}) {
    const params = new URLSearchParams()

    if (options.page) params.set('page', String(options.page))
    if (options.limit) params.set('limit', String(options.limit))
    if (options.search) params.set('search', options.search)
    if (options.status) params.set('status', options.status)
    if (options.city) params.set('city', options.city)
    if (options.createdAfter) params.set('createdAfter', options.createdAfter)
    if (options.createdBefore) params.set('createdBefore', options.createdBefore)
    if (options.minTotal !== undefined && options.minTotal >= 0) {
      params.set('minTotal', String(options.minTotal))
    }
    if (options.maxTotal !== undefined && options.maxTotal >= 0) {
      params.set('maxTotal', String(options.maxTotal))
    }
    if (options.sortBy) params.set('sortBy', options.sortBy)
    if (options.sortOrder) params.set('sortOrder', options.sortOrder)
    if (options.refresh) params.set('refresh', 'true')

    const query = params.toString()
    const response = await httpClient.get<{ data: OrdersListResponse; pagination: PaginationMeta }>(
      `/orders${query ? `?${query}` : ''}`,
    )

    return {
      records: response.data.data.orders,
      pagination: response.data.pagination,
    }
  },

  async getById(id: string): Promise<Order> {
    const response = await httpClient.get<{ data: { order: Order } }>(`/orders/${id}`)
    return response.data.data.order
  },

  async updateStatus(id: string, payload: UpdateOrderStatusPayload): Promise<Order> {
    const response = await httpClient.put<{ data: { order: Order } }>(`/orders/${id}/status`, payload)
    return response.data.data.order
  },
}
