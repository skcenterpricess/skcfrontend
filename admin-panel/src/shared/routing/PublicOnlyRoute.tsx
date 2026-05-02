import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="p-8 text-slate-500" role="status" aria-live="polite" aria-busy="true">
        Verifying session...
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
