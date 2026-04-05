import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useSessionPreferences } from '@/app/providers/SessionPreferencesProvider'
import { RoleProtectedRoute } from '@/shared/routing/RoleProtectedRoute'
import { PublicOnlyRoute } from '@/shared/routing/PublicOnlyRoute'
import { SidebarSection } from '@/app/navigation/SidebarSection'
import { sidebarSections, type SidebarSection as SidebarSectionType } from '@/app/navigation/sidebarConfig'
import CreateHeroPage from '@/pages/landpage/hero/create.hero'
import ListHeroPage from '@/pages/landpage/hero/list.hero'
import EditHeroPage from '@/pages/landpage/hero/edit.view.hero'
import CreateTestimonialPage from '@/pages/landpage/testimonial/create.testimonial'
import ListTestimonialPage from '@/pages/landpage/testimonial/list.testimonial'
import EditTestimonialPage from '@/pages/landpage/testimonial/edit.view.testimonial'
import CreateAchievementPage from '@/pages/landpage/Achievements/create.acheivement'
import ListAchievementPage from '@/pages/landpage/Achievements/list.achievement'
import EditAchievementPage from '@/pages/landpage/Achievements/edit.view.achievement'
import AddPageFormPage from '@/pages/AddPageFormPage'
import ContactPage from '@/pages/contact'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import LeadsPage from '@/pages/lead/LeadsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProductsPage from '@/pages/product'
import CreateProductPage from '@/pages/product/create.product'
import ProductListPage from '@/pages/product/product.list'
import EditProductPage from '@/pages/product/edit.view.product'
import ContactListPage from '@/pages/contact/list.contact'
import EditContactPage from '@/pages/contact/edit.view.contact'
import CreateLeadPage from '@/pages/lead/createlead'
import LeadListPage from '@/pages/lead/leadlist'
import EditLeadPage from '@/pages/lead/edit.view.lead'
import SettingsPage from '@/pages/user/SettingsPage'
import UsersPage from '@/pages/user/UsersPage'

function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth()
  const { compactMode, setCompactMode } = useSessionPreferences()
  const location = useLocation()
  const isSuperadmin = String(user?.role || '')
    .trim()
    .toLowerCase() === 'superadmin'
  const visibleSidebarSections = sidebarSections.filter(
    (section) => !section.roles || section.roles.includes(isSuperadmin ? 'superadmin' : 'admin')
  )
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setOpenSections((previous) => {
      const next: Record<string, boolean> = {}

      const hasActiveRoute = (section: SidebarSectionType) =>
        section.items.some(
          (item) =>
            location.pathname === item.to ||
            location.pathname.startsWith(`${item.to}/`)
        )

      visibleSidebarSections.forEach((section) => {
        const existing = previous[section.title]
        const initialValue = section.defaultOpen ?? !section.collapsible
        next[section.title] = existing ?? initialValue

        if (hasActiveRoute(section)) {
          next[section.title] = true
        }
      })

      return next
    })
  }, [location.pathname, visibleSidebarSections])

  const onToggleSection = (sectionTitle: string) => {
    setOpenSections((previous) => ({
      ...previous,
      [sectionTitle]: !previous[sectionTitle],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-4 lg:p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="flex h-full min-h-0 flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">SKC Admin</p>
              <h1 className="text-2xl font-bold">Control Center</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                className="rounded-md border border-white/20 px-3 py-1"
                onClick={() => setCompactMode(!compactMode)}
              >
                Compact: {compactMode ? 'On' : 'Off'}
              </button>
              {isAuthenticated ? (
                <button
                  className="rounded-md bg-emerald-500 px-3 py-1 font-medium"
                  onClick={() => logout()}
                >
                  Logout {user?.name}
                </button>
              ) : (
                <Link className="rounded-md bg-emerald-500 px-3 py-1 font-medium" to="/login">
                  Login
                </Link>
              )}
            </div>

            <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1 pt-2 text-sm">
              {visibleSidebarSections.map((section) => (
                <SidebarSection
                  key={section.title}
                  section={section}
                  isOpen={openSections[section.title] ?? true}
                  onToggle={() => onToggleSection(section.title)}
                />
              ))}
            </nav>
          </div>
        </aside>

        <main className={`${compactMode ? 'space-y-3' : 'space-y-5'} min-w-0`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <DashboardPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'user-onboard',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <UsersPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <Navigate to="/user-onboard" replace />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'pages/add',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <AddPageFormPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'contact',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <ContactPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'contact/list',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <ContactListPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'contact/edit/:id',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <EditContactPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'leads',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <LeadsPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'leads/create',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <CreateLeadPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'leads/list',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <LeadListPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'leads/edit/:id',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <EditLeadPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'products',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <ProductsPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'products/create',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <CreateProductPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'products/list',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <ProductListPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'products/edit/:id',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <EditProductPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <Navigate to="/content/header-slider" replace />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/header-slider',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <Navigate to="/content/header-slider/list" replace />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/header-slider/create',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <CreateHeroPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/header-slider/list',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <ListHeroPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/header-slider/edit/:id',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <EditHeroPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/testimonials',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <Navigate to="/content/testimonials/list" replace />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/testimonials/create',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <CreateTestimonialPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/testimonials/list',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <ListTestimonialPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/testimonials/edit/:id',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <EditTestimonialPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/achievements',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <Navigate to="/content/achievements/list" replace />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/achievements/create',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <CreateAchievementPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/achievements/list',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <ListAchievementPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content/achievements/edit/:id',
        element: (
          <RoleProtectedRoute roles={['superadmin']}>
            <EditAchievementPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <RoleProtectedRoute roles={['superadmin', 'admin']}>
            <SettingsPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
