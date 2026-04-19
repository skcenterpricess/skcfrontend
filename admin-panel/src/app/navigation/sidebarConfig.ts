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
    title: 'Hero Slider',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/content/header-slider', label: 'Overview' },
      { to: '/content/header-slider/list', label: 'Slides' },
    ],
  },
  {
    title: 'Testimonials',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/content/testimonials', label: 'Overview' },
      { to: '/content/testimonials/list', label: 'Testimonials' },
    ],
  },
  {
    title: 'Achievements',
    roles: ['superadmin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/content/achievements', label: 'Overview' },
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
    title: 'Operations',
    roles: ['superadmin', 'admin'],
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/settings', label: 'Settings' },
    ],
  },
]