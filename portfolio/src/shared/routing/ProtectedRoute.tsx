import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'

const LEAD_SESSION_KEY = 'portfolio.lead.session'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const hasLeadSession = typeof window !== 'undefined' && !!sessionStorage.getItem(LEAD_SESSION_KEY)

  if (isBootstrapping) {
    return (
      <div className="p-8 text-slate-500" role="status" aria-live="polite" aria-busy="true">
        Verifying session...
      </div>
    )
  }

  if (!isAuthenticated && !hasLeadSession) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
