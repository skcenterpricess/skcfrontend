export type AdminRole = 'superadmin' | 'admin' | 'user'

export interface SidebarItem {
  to: string
  label: string
}

export interface SidebarSection {
  title: string
  roles?: Array<'superadmin' | 'admin' | 'user'>
  collapsible?: boolean
  defaultOpen?: boolean
  items: SidebarItem[]
}

export const sidebarSections: SidebarSection[] = [
  {
    title: 'Workspace',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/user-onboard', label: 'User Onboard' },
    ],
  },
  {
    title: 'Portfolio',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/content/header-slider/list', label: 'Slides' },
      { to: '/content/testimonials/list', label: 'Testimonials' },
      { to: '/content/achievements/list', label: 'Achievements' },

    ],
  },
  {
    title: 'Products',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/products', label: 'Overview' },
      { to: '/products/create', label: 'Create Product' },
      { to: '/products/list', label: 'Products' },
    ],
  },
  {
    title: 'Contact',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/contact', label: 'Overview' },
      { to: '/contact/list', label: 'Contacts' },
    ],
  },
  {
    title: 'Leads',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/leads', label: 'Overview' },
      { to: '/leads/list', label: 'Leads' },
    ],
  },
  {
    title: 'Orders',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/orders', label: 'Overview' },
      { to: '/orders/list', label: 'Orders' },
    ],
  },
  {
    title: 'Operations',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/settings', label: 'Settings' },
    ],
  },
]
