import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { SessionPreferencesProvider } from '@/app/providers/SessionPreferencesProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SessionPreferencesProvider>{children}</SessionPreferencesProvider>
    </AuthProvider>
  )
}
