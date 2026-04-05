import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useSessionPreferences } from '@/app/providers/SessionPreferencesProvider'
import { leadAuthService } from '@/features/leads/services/leadAuthService'
import { ProtectedRoute } from '@/shared/routing/ProtectedRoute'
import { PublicOnlyRoute } from '@/shared/routing/PublicOnlyRoute'
import AboutPage from '@/pages/abouts/AboutPage'
import ContactPage from '@/pages/contacts/ContactPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import HomePage from '@/pages/home'
import LeadLoginPage from '@/pages/auth/LeadLoginPage'
import LeadProfilePage from '@/pages/auth/LeadProfilePage'
import LeadRegisterPage from '@/pages/auth/LeadRegisterPage'
import LoginPage from '@/pages/auth/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import CartPage from '@/pages/dashboard/carts/CartPage'
import ProjectsPage from '@/pages/products/index.product'
import ProductDetailPage from '@/pages/products/view.product'

const LEAD_SESSION_KEY = 'portfolio.lead.session'
const LEAD_SESSION_EVENT = 'lead:session:changed'

interface LeadSessionUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'lead'
}

function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth()
  const { compactMode, setCompactMode } = useSessionPreferences()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [leadSessionUser, setLeadSessionUser] = useState<LeadSessionUser | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadLeadSession = () => {
      try {
        const raw = sessionStorage.getItem(LEAD_SESSION_KEY)
        if (!raw) {
          setLeadSessionUser(null)
          return
        }
        setLeadSessionUser(JSON.parse(raw) as LeadSessionUser)
      } catch {
        setLeadSessionUser(null)
      }
    }

    loadLeadSession()
    window.addEventListener(LEAD_SESSION_EVENT, loadLeadSession)
    return () => window.removeEventListener(LEAD_SESSION_EVENT, loadLeadSession)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current) return
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const isLeadLoggedIn = !!leadSessionUser

  const displayName = useMemo(() => {
    if (isAuthenticated && user?.name) {
      return user.name
    }
    if (isLeadLoggedIn && leadSessionUser?.name) {
      return leadSessionUser.name
    }
    return ''
  }, [isAuthenticated, isLeadLoggedIn, leadSessionUser?.name, user?.name])

  const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'U'

  const profileUpdatePath = isLeadLoggedIn ? '/lead/profile' : '/dashboard'

  const onLogout = async () => {
    if (isAuthenticated) {
      await logout()
      return
    }
    if (isLeadLoggedIn) {
      await leadAuthService.logout()
    }
    setIsAccountMenuOpen(false)
  }

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/achievements', label: 'Achievements' },
    { to: '/contact', label: 'Contact' },
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="sticky top-3 z-30 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-4 shadow-lg backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                
                <h1 className="truncate text-lg uppercase font-black text-cyan-700 sm:text-xl">SKC Enterpricess</h1>
                <p className="text-xs tracking-[0.24em] ">let's build something amazing</p>
              </div>
            </div>

            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 lg:hidden"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>

            <div className="hidden items-center gap-2 text-sm lg:flex">
              <button
                className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700"
                onClick={() => setCompactMode(!compactMode)}
              >
                Compact: {compactMode ? 'On' : 'Off'}
              </button>
              {isAuthenticated ? (
                <div className="relative flex items-center" ref={accountMenuRef}>
                  <Link
                    to="/cart"
                    className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                    aria-label="Open cart"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4.5 w-4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3h2l.4 2M7 13h10l4-8H6.4" />
                      <path d="M7 13 5.4 5H3" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="18" cy="19" r="1.5" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white"
                    aria-label="Open account menu"
                    aria-expanded={isAccountMenuOpen}
                  >
                    {firstLetter}
                  </button>
                  {isAccountMenuOpen ? (
                    <div className="absolute right-0 top-11 z-40 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <Link
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        to={profileUpdatePath}
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Update Profile
                      </Link>
                      <button
                        type="button"
                        className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                        onClick={onLogout}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : isLeadLoggedIn ? (
                <div className="relative flex items-center" ref={accountMenuRef}>
                  <Link
                    to="/cart"
                    className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                    aria-label="Open cart"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4.5 w-4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3h2l.4 2M7 13h10l4-8H6.4" />
                      <path d="M7 13 5.4 5H3" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="18" cy="19" r="1.5" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white"
                    aria-label="Open account menu"
                    aria-expanded={isAccountMenuOpen}
                  >
                    {firstLetter}
                  </button>
                  {isAccountMenuOpen ? (
                    <div className="absolute right-0 top-11 z-40 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <Link
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        to={profileUpdatePath}
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Update Profile
                      </Link>
                      <button
                        type="button"
                        className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                        onClick={onLogout}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <Link className="rounded-md border border-cyan-700 px-3 py-1.5 font-medium text-cyan-700" to="/login">
                    Superadmin Login
                  </Link>
                  <Link className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white" to="/lead/login">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className={`${isMenuOpen ? 'mt-4 grid' : 'hidden'} gap-2 lg:hidden`}>
            <nav className="grid gap-2 text-sm">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <button
                className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700"
                onClick={() => setCompactMode(!compactMode)}
              >
                Compact: {compactMode ? 'On' : 'Off'}
              </button>
              {isAuthenticated ? (
                <div className="relative flex items-center" ref={accountMenuRef}>
                  <Link
                    to="/cart"
                    className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                    aria-label="Open cart"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3h2l.4 2M7 13h10l4-8H6.4" />
                      <path d="M7 13 5.4 5H3" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="18" cy="19" r="1.5" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
                    aria-label="Open account menu"
                    aria-expanded={isAccountMenuOpen}
                  >
                    {firstLetter}
                  </button>
                  {isAccountMenuOpen ? (
                    <div className="absolute left-0 top-10 z-40 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <Link
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        to={profileUpdatePath}
                        onClick={() => {
                          setIsAccountMenuOpen(false)
                          setIsMenuOpen(false)
                        }}
                      >
                        Update Profile
                      </Link>
                      <button
                        type="button"
                        className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                        onClick={onLogout}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : isLeadLoggedIn ? (
                <div className="relative flex items-center" ref={accountMenuRef}>
                  <Link
                    to="/cart"
                    className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                    aria-label="Open cart"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3h2l.4 2M7 13h10l4-8H6.4" />
                      <path d="M7 13 5.4 5H3" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="18" cy="19" r="1.5" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
                    aria-label="Open account menu"
                    aria-expanded={isAccountMenuOpen}
                  >
                    {firstLetter}
                  </button>
                  {isAccountMenuOpen ? (
                    <div className="absolute left-0 top-10 z-40 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <Link
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        to={profileUpdatePath}
                        onClick={() => {
                          setIsAccountMenuOpen(false)
                          setIsMenuOpen(false)
                        }}
                      >
                        Update Profile
                      </Link>
                      <button
                        type="button"
                        className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                        onClick={onLogout}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <Link className="rounded-md border border-cyan-700 px-3 py-1.5 font-medium text-cyan-700" to="/login">
                    Superadmin Login
                  </Link>
                  <Link className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white" to="/lead/login">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <nav
            className="mt-4 hidden gap-2 text-sm lg:grid"
            style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
          >
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-center font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className={`${compactMode ? 'space-y-3' : 'space-y-5'} flex-1`}>
          <Outlet />
        </main>

        <footer className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">SKC Portfolio</p>
              <p className="mt-1 text-slate-700">Built to showcase products, achievements, and client trust.</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-medium text-slate-800">All rights reserved.</p>
              <p>Copyright {new Date().getFullYear()} SKC</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProductDetailPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'achievements', element: <AboutPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'about-us', element: <Navigate to="/achievements" replace /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'lead/register', element: <LeadRegisterPage /> },
      { path: 'lead/login', element: <LeadLoginPage /> },
      { path: 'lead/profile', element: <LeadProfilePage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
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
