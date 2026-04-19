import { httpClient } from '@/shared/api/httpClient'
import type {
  Achievement,
  HeaderSidebar,
  ListResponse,
  Product,
  Testimonial,
} from '@/shared/types/content'

interface ListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  refresh?: boolean
}

export const contentService = {
  async getHeaderSidebar(): Promise<HeaderSidebar | null> {
    try {
      const response = await httpClient.get<{ data: { headersidebars: HeaderSidebar[] } }>(
        '/headersidebar?limit=1&sortOrder=desc'
      )
      return response.data.data.headersidebars?.[0] || null
    } catch {
      return null
    }
  },

  async getHeaderSlides(limit: number = 5): Promise<HeaderSidebar[]> {
    try {
      const response = await httpClient.get<{ data: { headersidebars: HeaderSidebar[] } }>(
        `/headersidebar?limit=${limit}&sortOrder=desc`
      )
      return response.data.data.headersidebars || []
    } catch {
      return []
    }
  },

  async getTopProducts(limit: number = 5): Promise<Product[]> {
    try {
      const response = await httpClient.get<{ data: { products: Product[] } }>(
        `/products?limit=${limit}&sortOrder=desc&isActive=true`
      )
      return response.data.data.products || []
    } catch {
      return []
    }
  },

  async getTopTestimonials(limit: number = 5): Promise<Testimonial[]> {
    try {
      const response = await httpClient.get<{ data: { testimonials: Testimonial[] } }>(
        `/testimonials?limit=${limit}&sortOrder=desc&isActive=true`
      )
      return response.data.data.testimonials || []
    } catch {
      return []
    }
  },

  async getTopAchievements(limit: number = 6): Promise<Achievement[]> {
    try {
      const response = await httpClient.get<{ data: { achievements: Achievement[] } }>(
        `/achievements?limit=${limit}&sortOrder=desc&isActive=true`
      )
      return response.data.data.achievements || []
    } catch {
      return []
    }
  },

  async listTestimonials(params: ListParams): Promise<ListResponse<Testimonial>> {
    const queryString = new URLSearchParams()
    if (params.page) queryString.append('page', String(params.page))
    if (params.limit) queryString.append('limit', String(params.limit))
    if (params.search) queryString.append('search', params.search)
    if (params.sortBy) queryString.append('sortBy', params.sortBy)
    if (params.sortOrder) queryString.append('sortOrder', params.sortOrder)
    if (params.isActive !== undefined) queryString.append('isActive', String(params.isActive))
    if (params.refresh) queryString.append('refresh', 'true')

    const response = await httpClient.get<{
      data: { testimonials: Testimonial[] }
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(`/testimonials?${queryString.toString()}`)

    return {
      records: response.data.data.testimonials,
      pagination: response.data.pagination
    }
  },

  async listHeaderSidebar(params: ListParams): Promise<ListResponse<HeaderSidebar>> {
    const queryString = new URLSearchParams()
    if (params.page) queryString.append('page', String(params.page))
    if (params.limit) queryString.append('limit', String(params.limit))
    if (params.search) queryString.append('search', params.search)
    if (params.sortBy) queryString.append('sortBy', params.sortBy)
    if (params.sortOrder) queryString.append('sortOrder', params.sortOrder)
    if (params.refresh) queryString.append('refresh', 'true')

    const response = await httpClient.get<{
      data: { headersidebars: HeaderSidebar[] }
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(`/headersidebar?${queryString.toString()}`)

    return {
      records: response.data.data.headersidebars,
      pagination: response.data.pagination
    }
  }
}
