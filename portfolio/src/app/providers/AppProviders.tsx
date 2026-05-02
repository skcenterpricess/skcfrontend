import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { SessionPreferencesProvider } from '@/app/providers/SessionPreferencesProvider'
import { ContentProvider } from '@/features/content/context/ContentContext'
import { CartProvider } from '@/features/shop/context/CartContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ContentProvider>
          <SessionPreferencesProvider>{children}</SessionPreferencesProvider>
        </ContentProvider>
      </CartProvider>
    </AuthProvider>
  )
}
