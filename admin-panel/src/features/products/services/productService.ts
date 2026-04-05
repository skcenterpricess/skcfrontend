import { httpClient } from '@/shared/api/httpClient'
import type {
  PaginationMeta,
  Product,
  ProductUpsertPayload,
  ProductsListResponse,
} from '@/shared/types/product'

interface QueryOptions {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  refresh?: boolean
}

export const productService = {
  async list(options: QueryOptions = {}) {
    const params = new URLSearchParams()

    if (options.page) params.set('page', String(options.page))
    if (options.limit) params.set('limit', String(options.limit))
    if (options.search) params.set('search', options.search)
    if (options.sortBy) params.set('sortBy', options.sortBy)
    if (options.sortOrder) params.set('sortOrder', options.sortOrder)
    if (options.isActive !== undefined) params.set('isActive', String(options.isActive))
    if (options.refresh) params.set('refresh', 'true')

    const query = params.toString()
    const response = await httpClient.get<{ data: ProductsListResponse; pagination: PaginationMeta }>(
      `/products${query ? `?${query}` : ''}`,
    )

    return {
      records: response.data.data.products,
      pagination: response.data.pagination,
    }
  },

  async create(payload: ProductUpsertPayload): Promise<Product> {
    const response = await httpClient.post<{ data: { product: Product } }>('/products', buildFormData(payload))
    return response.data.data.product
  },

  async getById(id: string): Promise<Product> {
    const response = await httpClient.get<{ data: { product: Product } }>(`/products/${id}`)
    return response.data.data.product
  },

  async update(id: string, payload: Partial<ProductUpsertPayload>): Promise<Product> {
    const response = await httpClient.put<{ data: { product: Product } }>(
      `/products/${id}`,
      buildFormData(payload),
    )
    return response.data.data.product
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/products/${id}`)
  },
}

function buildFormData(payload: Partial<ProductUpsertPayload>) {
  const formData = new FormData()

  const appendScalar = (key: string, value: unknown) => {
    if (value === undefined || value === null) return
    if (typeof value === 'boolean' || typeof value === 'number') {
      formData.append(key, String(value))
      return
    }
    if (typeof value === 'string') {
      formData.append(key, value)
    }
  }

  appendScalar('name', payload.name)
  appendScalar('base_price', payload.base_price)
  appendScalar('marked_price', payload.marked_price)
  appendScalar('coopan_price', payload.coopan_price)
  appendScalar('description', payload.description)
  appendScalar('size', payload.size)
  appendScalar('version', payload.version)
  appendScalar('stok', payload.stok)
  appendScalar('isActive', payload.isActive)

  if (payload.retainImagePublicIds !== undefined) {
    formData.append('retainImagePublicIds', JSON.stringify(payload.retainImagePublicIds))
  }

  payload.imageFiles?.forEach((file) => {
    formData.append('images', file)
  })

  return formData
}
