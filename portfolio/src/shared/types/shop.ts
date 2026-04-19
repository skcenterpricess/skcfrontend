import type { Product } from '@/shared/types/content'

type PopulatedProductRef = Partial<Product> & Pick<Product, '_id' | 'name'>

export interface CartItem {
  productId: PopulatedProductRef
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Cart {
  _id: string
  leadId: string
  items: CartItem[]
  subtotal: number
  totalItems: number
  status: 'active' | 'converted'
  createdAt: string
  updatedAt: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country?: string
}

export interface OrderItem {
  productId: PopulatedProductRef
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  _id: string
  leadId: string
  items: OrderItem[]
  subtotal: number
  totalItems: number
  status:
    | 'waiting_for_sales_contact'
    | 'contacted'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
  shippingAddress: ShippingAddress
  customerNote: string
  salesNote: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  _id: string
  productId: string
  leadId: {
    _id: string
    name: string
  }
  rating: number
  title: string
  comment: string
  isVisible: boolean
  createdAt: string
  updatedAt: string
}
