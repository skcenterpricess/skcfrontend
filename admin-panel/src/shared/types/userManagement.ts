export type ManagedUserRole = 'superadmin' | 'admin'

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: ManagedUserRole
  isActive: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface UsersListResponse {
  users: ManagedUser[]
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface OnboardUserPayload {
  name: string
  email: string
  password: string
  role?: 'admin'
  isActive?: boolean
}
