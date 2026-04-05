export interface ProductImage {
  url: string
  public_id: string
  isPrimary?: boolean
}

export interface Product {
  _id: string
  name: string
  base_price: number
  marked_price: number
  coopan_price: number
  description: string
  size: string
  version: string
  stok: number
  avgRating: number
  ratingCount: number
  isActive: boolean
  images?: ProductImage[]
  createdAt: string
  updatedAt: string
}

export interface ProductFormPayload {
  name: string
  base_price: number
  marked_price: number
  coopan_price: number
  description: string
  size: string
  version?: string
  stok: number
  isActive: boolean
}

export interface ProductUpsertPayload extends ProductFormPayload {
  imageFiles?: File[]
  retainImagePublicIds?: string[]
}

export interface ProductsListResponse {
  products: Product[]
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}
