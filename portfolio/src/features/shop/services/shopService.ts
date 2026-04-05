import { httpClient } from '@/shared/api/httpClient'
import type { Product } from '@/shared/types/content'
import type { Cart, Order, Review, ShippingAddress } from '@/shared/types/shop'

interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ListProductsResult {
  records: Product[]
  pagination: Pagination
}

interface ListOrdersResult {
  records: Order[]
  pagination: Pagination
}

interface ListReviewsResult {
  records: Review[]
  pagination: Pagination
}

interface ProductResponse {
  product: Product
}

const normalizeProduct = (product: Product): Product => ({
  ...product,
  images: Array.isArray(product.images) ? product.images : [],
})

export const shopService = {
  async listProducts(params: ProductQuery = {}): Promise<ListProductsResult> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.search) query.set('search', params.search)
    if (params.sortBy) query.set('sortBy', params.sortBy)
    if (params.sortOrder) query.set('sortOrder', params.sortOrder)
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive))

    const response = await httpClient.get<{ data: { products: Product[] }; pagination: Pagination }>(
      `/products${query.toString() ? `?${query.toString()}` : ''}`,
    )

    return {
      records: response.data.data.products,
      pagination: response.data.pagination,
    }
  },

  async getProductById(productId: string): Promise<Product> {
    const response = await httpClient.get<{ data: ProductResponse }>(`/products/${productId}`)
    return normalizeProduct(response.data.data.product)
  },

  async getMyCart(): Promise<Cart> {
    const response = await httpClient.get<{ data: { cart: Cart } }>('/cart/me')
    return response.data.data.cart
  },

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    const response = await httpClient.post<{ data: { cart: Cart } }>('/cart/items', {
      productId,
      quantity,
    })
    return response.data.data.cart
  },

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    const response = await httpClient.put<{ data: { cart: Cart } }>(`/cart/items/${productId}`, {
      quantity,
    })
    return response.data.data.cart
  },

  async removeCartItem(productId: string): Promise<Cart> {
    const response = await httpClient.delete<{ data: { cart: Cart } }>(`/cart/items/${productId}`)
    return response.data.data.cart
  },

  async placeOrder(shippingAddress: ShippingAddress, customerNote: string): Promise<Order> {
    const response = await httpClient.post<{ data: { order: Order } }>('/orders/place', {
      shippingAddress,
      customerNote,
    })
    return response.data.data.order
  },

  async listMyOrders(page = 1, limit = 10): Promise<ListOrdersResult> {
    const response = await httpClient.get<{ data: { orders: Order[] }; pagination: Pagination }>(
      `/orders/me?page=${page}&limit=${limit}&sortOrder=desc`,
    )

    return {
      records: response.data.data.orders,
      pagination: response.data.pagination,
    }
  },

  async createReview(productId: string, payload: { rating: number; title?: string; comment: string }): Promise<Review> {
    const response = await httpClient.post<{ data: { review: Review } }>(`/products/${productId}/reviews`, payload)
    return response.data.data.review
  },

  async listReviewsByProduct(productId: string, page = 1, limit = 5): Promise<ListReviewsResult> {
    const response = await httpClient.get<{ data: { reviews: Review[] }; pagination: Pagination }>(
      `/products/${productId}/reviews?page=${page}&limit=${limit}&sortOrder=desc&isVisible=true`,
    )

    return {
      records: response.data.data.reviews,
      pagination: response.data.pagination,
    }
  },
}
