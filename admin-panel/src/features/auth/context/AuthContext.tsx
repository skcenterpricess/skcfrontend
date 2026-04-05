import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/features/auth/services/authService'
import type { AuthUser, LoginPayload } from '@/shared/types/auth'

function canonicalizeRole(rawRole: string): AuthUser['role'] {
  const normalized = String(rawRole || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

  if (normalized === 'superadmin') return 'superadmin'
  if (normalized === 'superadim') return 'superadmin'
  if (normalized === 'admin' || normalized === 'user' || normalized === 'manager') return 'admin'

  return 'admin'
}

function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    role: canonicalizeRole(String(user.role || '')),
  }
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const bootstrap = useCallback(async () => {
    try {
      const me = await authService.me()
      setUser(normalizeAuthUser(me))
    } catch {
      setUser(null)
    } finally {
      setIsBootstrapping(false)
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedInUser = await authService.login(payload)
    setUser(normalizeAuthUser(loggedInUser))
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const refresh = useCallback(async () => {
    await authService.refresh()
    const me = await authService.me()
    setUser(normalizeAuthUser(me))
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping,
      login,
      logout,
      refresh,
    }),
    [isBootstrapping, login, logout, refresh, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
