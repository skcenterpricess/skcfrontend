import { httpClient } from '@/shared/api/httpClient'
import type { Achievement, HeaderSidebar, Testimonial, ListResponse } from '@/shared/types/content'

interface ListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  refresh?: boolean
}

interface TestimonialPayload {
  name: string
  designation: string
  message: string
  image: File
  isActive?: boolean
}

interface TestimonialUpdatePayload {
  name?: string
  designation?: string
  message?: string
  image?: File
  isActive?: boolean
}

interface AchievementPayload {
  title: string
  description: string
  value?: string
  image: File
  isActive?: boolean
}

interface AchievementUpdatePayload {
  title?: string
  description?: string
  value?: string
  image?: File
  isActive?: boolean
}

interface HeaderPayload {
  image: File
  heading: string
  description: string
}

interface HeaderUpdatePayload {
  image?: File
  heading?: string
  description?: string
}

function toFormData<T extends object>(payload: T) {
  const formData = new FormData()

  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined) return
    if (typeof value === 'boolean') {
      formData.append(key, String(value))
      return
    }

    if (typeof value !== 'string' && !(value instanceof File)) return

    formData.append(key, value)
  })

  return formData
}

export const contentService = {
  async listTestimonials(params: ListParams = {}): Promise<ListResponse<Testimonial>> {
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

  async listHeaderSidebar(params: ListParams = {}): Promise<ListResponse<HeaderSidebar>> {
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
  },

  async listAchievements(params: ListParams = {}): Promise<ListResponse<Achievement>> {
    const queryString = new URLSearchParams()
    if (params.page) queryString.append('page', String(params.page))
    if (params.limit) queryString.append('limit', String(params.limit))
    if (params.search) queryString.append('search', params.search)
    if (params.sortBy) queryString.append('sortBy', params.sortBy)
    if (params.sortOrder) queryString.append('sortOrder', params.sortOrder)
    if (params.isActive !== undefined) queryString.append('isActive', String(params.isActive))
    if (params.refresh) queryString.append('refresh', 'true')

    try {
      const response = await httpClient.get<{
        data: { achievements: Achievement[] }
        pagination: { page: number; limit: number; total: number; pages: number }
      }>(`/achievements?${queryString.toString()}`)

      return {
        records: response.data.data.achievements,
        pagination: response.data.pagination
      }
    } catch (error: unknown) {
      const maybeError = error as { response?: { status?: number } }

      // Keep Content page usable until achievements API is added on backend.
      if (maybeError.response?.status === 404) {
        return {
          records: [],
          pagination: {
            page: params.page ?? 1,
            limit: params.limit ?? 5,
            total: 0,
            pages: 1,
          },
        }
      }

      throw error
    }
  },

  async createTestimonial(payload: TestimonialPayload): Promise<Testimonial> {
    const response = await httpClient.post<{ data: { testimonial: Testimonial } }>(
      '/testimonials',
      toFormData(payload),
    )
    return response.data.data.testimonial
  },

  async updateTestimonial(id: string, payload: TestimonialUpdatePayload): Promise<Testimonial> {
    const response = await httpClient.put<{ data: { testimonial: Testimonial } }>(
      `/testimonials/${id}`,
      toFormData(payload),
    )
    return response.data.data.testimonial
  },

  async deleteTestimonial(id: string): Promise<void> {
    await httpClient.delete(`/testimonials/${id}`)
  },

  async createHeaderSidebar(payload: HeaderPayload): Promise<HeaderSidebar> {
    const response = await httpClient.post<{ data: { headersidebar: HeaderSidebar } }>(
      '/headersidebar',
      toFormData(payload),
    )
    return response.data.data.headersidebar
  },

  async updateHeaderSidebar(id: string, payload: HeaderUpdatePayload): Promise<HeaderSidebar> {
    const response = await httpClient.put<{ data: { headersidebar: HeaderSidebar } }>(
      `/headersidebar/${id}`,
      toFormData(payload),
    )
    return response.data.data.headersidebar
  },

  async deleteHeaderSidebar(id: string): Promise<void> {
    await httpClient.delete(`/headersidebar/${id}`)
  },

  async createAchievement(payload: AchievementPayload): Promise<Achievement> {
    const response = await httpClient.post<{ data: { achievement: Achievement } }>(
      '/achievements',
      toFormData(payload),
    )
    return response.data.data.achievement
  },

  async updateAchievement(id: string, payload: AchievementUpdatePayload): Promise<Achievement> {
    const response = await httpClient.put<{ data: { achievement: Achievement } }>(
      `/achievements/${id}`,
      toFormData(payload),
    )
    return response.data.data.achievement
  },

  async deleteAchievement(id: string): Promise<void> {
    await httpClient.delete(`/achievements/${id}`)
  }
}
