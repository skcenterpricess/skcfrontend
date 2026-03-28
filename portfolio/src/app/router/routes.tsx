import { Link, Outlet, createBrowserRouter } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useSessionPreferences } from '@/app/providers/SessionPreferencesProvider'
import { ProtectedRoute } from '@/shared/routing/ProtectedRoute'
import { PublicOnlyRoute } from '@/shared/routing/PublicOnlyRoute'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import DashboardPage from '@/pages/DashboardPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProjectsPage from '@/pages/ProjectsPage'

function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth()
  const { compactMode, setCompactMode } = useSessionPreferences()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">SKC Portfolio</p>
              <h1 className="text-2xl font-bold">Frontend Architecture Baseline</h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                className="rounded-md border border-white/20 px-3 py-1"
                onClick={() => setCompactMode(!compactMode)}
              >
                Compact: {compactMode ? 'On' : 'Off'}
              </button>
              {isAuthenticated ? (
                <button className="rounded-md bg-cyan-500 px-3 py-1 font-medium" onClick={() => logout()}>
                  Logout {user?.name}
                </button>
              ) : (
                <Link className="rounded-md bg-cyan-500 px-3 py-1 font-medium" to="/login">
                  Login
                </Link>
              )}
            </div>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 text-sm">
          {[
            ['/', 'Home'],
            ['/projects', 'Projects'],
            ['/about', 'About'],
            ['/contact', 'Contact'],
            ['/dashboard', 'Dashboard'],
          ].map(([to, label]) => (
            <Link
              key={to}
              className="rounded-lg bg-white px-3 py-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
              to={to}
            >
              {label}
            </Link>
          ))}
        </nav>

        <main className={compactMode ? 'space-y-3' : 'space-y-5'}>
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
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
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
