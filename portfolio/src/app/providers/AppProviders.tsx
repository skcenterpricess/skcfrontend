import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { SessionPreferencesProvider } from '@/app/providers/SessionPreferencesProvider'
import { ContentProvider } from '@/features/content/context/ContentContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ContentProvider>
        <SessionPreferencesProvider>{children}</SessionPreferencesProvider>
      </ContentProvider>
    </AuthProvider>
  )
}
