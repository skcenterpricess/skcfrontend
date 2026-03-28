import { Link, Outlet, createBrowserRouter } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useSessionPreferences } from '@/app/providers/SessionPreferencesProvider'
import { RoleProtectedRoute } from '@/shared/routing/RoleProtectedRoute'
import { PublicOnlyRoute } from '@/shared/routing/PublicOnlyRoute'
import ContentPage from '@/pages/ContentPage'
import DashboardPage from '@/pages/DashboardPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import SettingsPage from '@/pages/SettingsPage'
import UsersPage from '@/pages/UsersPage'

function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth()
  const { compactMode, setCompactMode } = useSessionPreferences()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">SKC Admin</p>
              <h1 className="text-2xl font-bold">Control Center</h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
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
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 text-sm">
          {[
            ['/', 'Home'],
            ['/dashboard', 'Dashboard'],
            ['/users', 'Users'],
            ['/content', 'Content'],
            ['/settings', 'Settings'],
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
      {
        path: 'dashboard',
        element: (
          <RoleProtectedRoute role="admin">
            <DashboardPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <RoleProtectedRoute role="admin">
            <UsersPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'content',
        element: (
          <RoleProtectedRoute role="admin">
            <ContentPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <RoleProtectedRoute role="admin">
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
