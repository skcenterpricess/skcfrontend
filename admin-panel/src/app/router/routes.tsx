import { useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import {
  useSessionPreferences,
  type ThemeMode,
} from '@/app/providers/SessionPreferencesProvider'
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
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/Auth/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
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
  const { isAuthenticated, user } = useAuth()
  const { compactMode, themeMode } = useSessionPreferences()
  const location = useLocation()
  const isSuperadmin = String(user?.role || '')
    .trim()
    .toLowerCase() === 'superadmin'
  const visibleSidebarSections = useMemo(
    () =>
      sidebarSections.filter(
        (section) => !section.roles || section.roles.includes(isSuperadmin ? 'superadmin' : 'admin')
      ),
    [isSuperadmin]
  )
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

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
  }, [isAuthenticated, location.pathname, visibleSidebarSections])

  const onToggleSection = (sectionTitle: string) => {
    setOpenSections((previous) => ({
      ...previous,
      [sectionTitle]: !previous[sectionTitle],
    }))
  }

  const themeClassByMode: Record<ThemeMode, {
    shell: string
    sidebar: string
    sidebarKicker: string
    sidebarTitle: string
    sidebarSubtitle: string
    main: string
  }> = {
    light: {
      shell:
        'min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_36%)] bg-surface-100 p-3 sm:p-4 lg:p-6',
      sidebar:
        'rounded-3xl border border-slate-900/40 bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-cyan-950/90 p-5 text-slate-50 shadow-xl backdrop-blur',
      sidebarKicker:
        'text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cyan-200/90',
      sidebarTitle: 'mt-1 text-2xl font-bold text-slate-50',
      sidebarSubtitle: 'mt-1 text-xs text-slate-300',
      main: `${compactMode ? 'space-y-3' : 'space-y-5'} min-w-0 rounded-3xl border border-brand-200/70 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4 lg:p-6`,
    },
    dark: {
      shell:
        'min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(30,58,138,0.32),transparent_44%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.56),transparent_34%)] bg-slate-950 p-3 sm:p-4 lg:p-6',
      sidebar:
        'rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-slate-900/95 via-slate-900/95 to-slate-950 p-5 text-slate-100 shadow-xl shadow-cyan-950/30 backdrop-blur',
      sidebarKicker:
        'text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cyan-300/90',
      sidebarTitle: 'mt-1 text-2xl font-bold text-slate-100',
      sidebarSubtitle: 'mt-1 text-xs text-slate-300',
      main: `${compactMode ? 'space-y-3' : 'space-y-5'} min-w-0 rounded-3xl border border-slate-700/70 bg-slate-900/70 p-3 text-slate-100 shadow-sm backdrop-blur sm:p-4 lg:p-6`,
    },
  }

  const activeTheme = themeClassByMode[themeMode]

  return (
    <div className={activeTheme.shell}>
      <div
        className={`mx-auto grid w-full max-w-7xl gap-4 ${
          isAuthenticated ? 'md:grid-cols-[270px_1fr]' : 'md:grid-cols-1'
        }`}
      >
        {isAuthenticated ? (
          <aside className={`${activeTheme.sidebar} md:sticky md:top-4 md:h-[calc(100vh-2rem)]`}>
            <div className="flex h-full min-h-0 flex-col gap-5">
              <div className="border-b border-white/10 pb-4">
                <p className={activeTheme.sidebarKicker}>SKC Admin</p>
                <h1 className={activeTheme.sidebarTitle}>Control Center</h1>
                <p className={activeTheme.sidebarSubtitle}>Manage content, users, and operations</p>
              </div>
              <nav className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-sm">
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
        ) : null}
        <main className={activeTheme.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
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
            <Navigate to="/contact/list" replace />
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
            <Navigate to="/leads/list" replace />
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
            <Navigate to="/products/list" replace />
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
