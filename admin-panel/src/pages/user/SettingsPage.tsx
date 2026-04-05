import { useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useSessionPreferences } from '@/app/providers/SessionPreferencesProvider'

export default function SettingsPage() {
  const { user, refresh, logout } = useAuth()
  const { compactMode, setCompactMode } = useSessionPreferences()
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
    <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-2 text-slate-600">Manage your current account session and admin workspace preferences.</p>
      </header>

      {message ? <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Account</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{user?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user?.email || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium capitalize text-slate-900">{user?.role || '-'}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefreshSession}
              disabled={isRefreshing}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
            </button>
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Interface Preferences</h3>
          <p className="mt-1 text-sm text-slate-600">These settings are saved in the current browser session.</p>

          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <span>
                <span className="block text-sm font-medium text-slate-900">Compact layout</span>
                <span className="block text-xs text-slate-500">Reduce spacing density in admin content areas.</span>
              </span>
              <button
                type="button"
                onClick={() => setCompactMode(!compactMode)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  compactMode ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {compactMode ? 'On' : 'Off'}
              </button>
            </label>

            <button
              type="button"
              onClick={onResetPreferences}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Reset Preferences
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}
