import { httpClient } from '@/shared/api/httpClient'
import axios from 'axios'
import type { Product } from '@/shared/types/content'
import type { Address, Cart, Order, Review, ShippingAddress } from '@/shared/types/shop'

export const SHOP_CART_CHANGED_EVENT = 'shop:cart:changed'

const emitCartChanged = (cart: Cart) => {
  window.dispatchEvent(
    new CustomEvent(SHOP_CART_CHANGED_EVENT, {
      detail: { cart },
    }),
  )
}

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

interface ListAddressesResult {
  records: Address[]
  pagination: Pagination
}

interface ListReviewsResult {
  records: Review[]
  pagination: Pagination
}

interface ProductResponse {
  product: Product
}

export type ShopErrorReason =
  | 'review-not-purchased'
  | 'review-already-exists'
  | 'product-not-found'
  | 'stock-unavailable'
  | 'unauthorized'
  | 'network'
  | 'unknown'

export interface ShopErrorDetails {
  message: string
  reason: ShopErrorReason
  status?: number
}

const normalizeProduct = (product: Product): Product => ({
  ...product,
  images: Array.isArray(product.images) ? product.images : [],
})

const extractApiMessage = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : null
  }

  const responseData = error.response?.data as
    | { message?: string; error?: { message?: string }; data?: { message?: string } }
    | undefined

  return (
    responseData?.message
    ?? responseData?.error?.message
    ?? responseData?.data?.message
    ?? error.message
    ?? null
  )
}

export const getShopErrorDetails = (error: unknown, fallbackMessage = 'Something went wrong'): ShopErrorDetails => {
  const message = extractApiMessage(error) ?? fallbackMessage
  const normalizedMessage = message.toLowerCase()
  const status = axios.isAxiosError(error) ? error.response?.status : undefined

  if (status === 401 || normalizedMessage.includes('authentication required')) {
    return { message: 'Sign in as lead to continue.', reason: 'unauthorized', status }
  }
  if (normalizedMessage.includes('purchased this product')) {
    return {
      message: 'Only customers who purchased this product can submit a review.',
      reason: 'review-not-purchased',
      status,
    }
  }
  if (normalizedMessage.includes('already reviewed')) {
    return {
      message: 'You have already reviewed this product.',
      reason: 'review-already-exists',
      status,
    }
  }
  if (normalizedMessage.includes('requested quantity is greater than available stock') || normalizedMessage.includes('insufficient stock')) {
    return {
      message: 'Stock changed while updating your cart. Please reduce quantity and try again.',
      reason: 'stock-unavailable',
      status,
    }
  }
  if (status === 404 || normalizedMessage.includes('product not found') || normalizedMessage.includes('unavailable')) {
    return {
      message: 'This product is no longer available.',
      reason: 'product-not-found',
      status,
    }
  }
  if (normalizedMessage.includes('network') || normalizedMessage.includes('timeout')) {
    return {
      message: 'Network issue detected. Please try again.',
      reason: 'network',
      status,
    }
  }

  return { message, reason: 'unknown', status }
}

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
      records: response.data.data.products.map(normalizeProduct),
      pagination: response.data.pagination,
    }
  },

  async getProductById(productId: string, signal?: AbortSignal): Promise<Product> {
    const response = await httpClient.get<{ data: ProductResponse }>(`/products/${productId}`, { signal })
    return normalizeProduct(response.data.data.product)
  },

  async getMyCart(): Promise<Cart> {
    const response = await httpClient.get<{ data: { cart: Cart } }>('/cart/me')
    emitCartChanged(response.data.data.cart)
    return response.data.data.cart
  },

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    const response = await httpClient.post<{ data: { cart: Cart } }>('/cart/items', {
      productId,
      quantity,
    })
    emitCartChanged(response.data.data.cart)
    return response.data.data.cart
  },

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    const response = await httpClient.put<{ data: { cart: Cart } }>(`/cart/items/${productId}`, {
      quantity,
    })
    emitCartChanged(response.data.data.cart)
    return response.data.data.cart
  },

  async removeCartItem(productId: string): Promise<Cart> {
    const response = await httpClient.delete<{ data: { cart: Cart } }>(`/cart/items/${productId}`)
    emitCartChanged(response.data.data.cart)
    return response.data.data.cart
  },

  async listMyAddresses(page = 1, limit = 20): Promise<ListAddressesResult> {
    const response = await httpClient.get<{ data: { addresses: Address[] }; pagination: Pagination }>(
      `/address/me?page=${page}&limit=${limit}&sortOrder=desc`,
    )

    return {
      records: response.data.data.addresses,
      pagination: response.data.pagination,
    }
  },

  async createAddress(payload: ShippingAddress): Promise<Address> {
    const response = await httpClient.post<{ data: { address: Address } }>('/address', payload)
    return response.data.data.address
  },

  async updateAddress(addressId: string, payload: Partial<ShippingAddress>): Promise<Address> {
    const response = await httpClient.put<{ data: { address: Address } }>(`/address/me/${addressId}`, payload)
    return response.data.data.address
  },

  async deleteAddress(addressId: string): Promise<void> {
    await httpClient.delete(`/address/me/${addressId}`)
  },

  async placeOrder(addressId: string, customerNote: string): Promise<Order> {
    const response = await httpClient.post<{ data: { order: Order } }>('/orders/place', {
      addressId,
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

  async listMyReviews(page = 1, limit = 10): Promise<ListReviewsResult> {
    const response = await httpClient.get<{ data: { reviews: Review[] }; pagination: Pagination }>(
      `/leads/me/reviews?page=${page}&limit=${limit}&sortOrder=desc`,
    )

    return {
      records: response.data.data.reviews,
      pagination: response.data.pagination,
    }
  },

  async updateReview(reviewId: string, payload: { rating?: number; title?: string; comment?: string }): Promise<Review> {
    const response = await httpClient.put<{ data: { review: Review } }>(`/reviews/${reviewId}`, payload)
    return response.data.data.review
  },

  async deleteReview(reviewId: string): Promise<void> {
    await httpClient.delete(`/reviews/${reviewId}`)
  },

  async hasPurchasedProduct(productId: string): Promise<boolean> {
    const pageLimit = 50
    const maxPagesToScan = 5

    for (let page = 1; page <= maxPagesToScan; page += 1) {
      const result = await this.listMyOrders(page, pageLimit)
      const hasPurchased = result.records.some((order) =>
        order.items.some((item) => item.productId?._id === productId),
      )
      if (hasPurchased) {
        return true
      }

      if (page >= result.pagination.pages) {
        break
      }
    }

    return false
  },

  async createReview(productId: string, payload: { rating: number; title?: string; comment: string }): Promise<Review> {
    const response = await httpClient.post<{ data: { review: Review } }>(`/products/${productId}/reviews`, payload)
    return response.data.data.review
  },

  async listReviewsByProduct(productId: string, page = 1, limit = 5, signal?: AbortSignal): Promise<ListReviewsResult> {
    const response = await httpClient.get<{ data: { reviews: Review[] }; pagination: Pagination }>(
      `/products/${productId}/reviews?page=${page}&limit=${limit}&sortOrder=desc&isVisible=true`,
      { signal },
    )

    return {
      records: response.data.data.reviews,
      pagination: response.data.pagination,
    }
  },
}
