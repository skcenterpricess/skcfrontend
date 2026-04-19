import { useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import {
  useSessionPreferences,
  type ThemeMode,
} from '@/app/providers/SessionPreferencesProvider'

const THEME_OPTIONS: Array<{
  value: ThemeMode
  label: string
  description: string
}> = [
  {
    value: 'light',
    label: 'Light Theme',
    description: 'Bright UI surfaces for daytime and high-clarity workflows.',
  },
  {
    value: 'dark',
    label: 'Dark Theme',
    description: 'Low-light UI with stronger contrast and reduced glare.',
  },
]

export default function SettingsPage() {
  const { user, refresh, logout } = useAuth()
  const { compactMode, setCompactMode, themeMode, setThemeMode } =
    useSessionPreferences()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const onRefreshSession = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      setMessage(null)
      await refresh()
      setMessage('Session refreshed successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh session')
    } finally {
      setIsRefreshing(false)
    }
  }

  const onResetPreferences = () => {
    setCompactMode(false)
    setThemeMode('light')
    setError(null)
    setMessage('Interface preferences were reset for this session.')
  }

  const onSignOut = async () => {
    try {
      setIsSigningOut(true)
      setError(null)
      setMessage(null)
      await logout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-brand-200/70">
      <header>
        <h2 className="text-2xl font-semibold text-brand-900">Settings</h2>
        <p className="mt-2 text-brand-700">Manage your current account session and admin workspace preferences.</p>
      </header>

      {message ? <p className="rounded bg-success-50 p-3 text-sm text-success-700">{message}</p> : null}
      {error ? <p className="rounded bg-danger-50 p-3 text-sm text-danger-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-brand-200 p-5">
          <h3 className="text-lg font-semibold text-brand-900">Account</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-brand-600">Name</dt>
              <dd className="font-medium text-brand-900">{user?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-brand-600">Email</dt>
              <dd className="font-medium text-brand-900">{user?.email || '-'}</dd>
            </div>
            <div>
              <dt className="text-brand-600">Role</dt>
              <dd className="font-medium capitalize text-brand-900">{user?.role || '-'}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefreshSession}
              disabled={isRefreshing}
              className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
            </button>
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-brand-200 p-5">
          <h3 className="text-lg font-semibold text-brand-900">Interface Preferences</h3>
          <p className="mt-1 text-sm text-brand-700">These settings are saved in the current browser session.</p>

          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-brand-200 p-3">
              <span>
                <span className="block text-sm font-medium text-brand-900">Compact layout</span>
                <span className="block text-xs text-brand-600">Reduce spacing density in admin content areas.</span>
              </span>
              <button
                type="button"
                onClick={() => setCompactMode(!compactMode)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  compactMode ? 'bg-success-100 text-success-700' : 'bg-surface-200 text-brand-700'
                }`}
              >
                {compactMode ? 'On' : 'Off'}
              </button>
            </label>

            <div className="rounded-lg border border-brand-200 p-3">
              <p className="text-sm font-medium text-brand-900">Theme mode</p>
              <p className="mt-1 text-xs text-brand-600">Choose between light and dark mode for the admin shell.</p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {THEME_OPTIONS.map((option) => {
                  const isActive = themeMode === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setThemeMode(option.value)}
                      className={`rounded-lg border p-3 text-left transition ${
                        isActive
                          ? 'border-brand-600 bg-brand-50 shadow-sm'
                          : 'border-brand-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-brand-900">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs text-brand-600">
                        {option.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={onResetPreferences}
              className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700"
            >
              Reset Preferences
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}
