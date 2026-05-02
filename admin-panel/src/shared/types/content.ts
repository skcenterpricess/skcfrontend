export interface HeaderSidebar {
  _id: string
  image: string
  heading: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Testimonial {
  _id: string
  name: string
  designation: string
  message: string
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  _id: string
  title: string
  description: string
  value?: string
  image?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface ListResponse<T> {
  records: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ContentSectionOption {
  title: string
  description: string
  to: string
}
