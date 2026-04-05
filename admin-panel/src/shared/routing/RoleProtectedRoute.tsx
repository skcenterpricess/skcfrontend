import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'

export function RoleProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles: Array<'superadmin' | 'admin' | 'user'>
}) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const normalizedUserRole = String(user?.role || '')
    .trim()
    .toLowerCase()
  const normalizedAllowedRoles = roles.map((role) => role.trim().toLowerCase())

  if (isBootstrapping) {
    return <div className="p-8 text-slate-500">Loading session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (normalizedUserRole === 'superadmin') {
    return <>{children}</>
  }

  if (!normalizedUserRole || !normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
