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
    title: 'Overview',
    roles: ['superadmin', 'admin'],
    defaultOpen: true,
    items: [{ to: '/dashboard', label: 'Dashboard' }],
  },
  {
    title: 'Workspace',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/user-onboard', label: 'User Onboard' },
      { to: '/pages/add', label: 'Add Page' },
    ],
  },
  {
    title: 'Header Slider',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/content/header-slider', label: 'Overview' },
      { to: '/content/header-slider/create', label: 'Create Slide' },
      { to: '/content/header-slider/list', label: 'All Slides' },
    ],
  },
  {
    title: 'Testimonials',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/content/testimonials', label: 'Overview' },
      { to: '/content/testimonials/create', label: 'Create Testimonial' },
      { to: '/content/testimonials/list', label: 'All Testimonials' },
    ],
  },
  {
    title: 'Achievements',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/content/achievements', label: 'Overview' },
      { to: '/content/achievements/create', label: 'Create Achievement' },
      { to: '/content/achievements/list', label: 'All Achievements' },
    ],
  },
  {
    title: 'Products',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/products', label: 'Products' },
      { to: '/products/create', label: 'Create Product' },
      { to: '/products/list', label: 'All Products' },
    ],
  },
  {
    title: 'Contact',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/contact', label: 'Contact' },
      { to: '/contact/list', label: 'All Contacts' },
    ],
  },
  {
    title: 'Leads',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/leads', label: 'Leads' },
      { to: '/leads/create', label: 'Create Lead' },
      { to: '/leads/list', label: 'All Leads' },
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