export type OrderStatus =
  | 'waiting_for_sales_contact'
  | 'contacted'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderLead {
  _id: string
  name: string
  email: string
  phone: string
}

export interface OrderProduct {
  _id: string
  name: string
}

export interface OrderItem {
  productId: string | OrderProduct
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface OrderShippingAddress {
  _id: string
  fullName: string
  phone: string
  area?: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface Order {
  _id: string
  leadId: string | OrderLead
  items: OrderItem[]
  subtotal: number
  totalItems: number
  status: OrderStatus
  shippingAddress: string | OrderShippingAddress
  customerNote?: string
  salesNote?: string
  createdAt: string
  updatedAt: string
}

export interface OrdersListResponse {
  orders: Order[]
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus
  salesNote?: string
}
