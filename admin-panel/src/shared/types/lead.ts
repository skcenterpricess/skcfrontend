export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'

export interface Lead {
  _id: string
  name: string
  email: string
  phone: string
  message: string
  status: LeadStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface LeadsListResponse {
  leads: Lead[]
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface LeadFormPayload {
  name: string
  email: string
  phone: string
  message: string
  status: LeadStatus
  notes?: string
}
