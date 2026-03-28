import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'

export function RoleProtectedRoute({
  children,
  role,
}: {
  children: ReactNode
  role: 'admin' | 'user'
}) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()

  if (isBootstrapping) {
    return <div className="p-8 text-slate-500">Loading session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
