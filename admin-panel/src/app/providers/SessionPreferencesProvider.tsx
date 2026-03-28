import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { sessionStore } from '@/shared/persistence/sessionStore'

interface SessionPreferencesValue {
  compactMode: boolean
  setCompactMode: (next: boolean) => void
}

const STORAGE_KEY = 'admin-ui-preferences'

const SessionPreferencesContext = createContext<SessionPreferencesValue | undefined>(
  undefined,
)

export function SessionPreferencesProvider({
  children,
}: {
  children: ReactNode
}) {
  const [compactMode, setCompactModeState] = useState<boolean>(() =>
    sessionStore.get(STORAGE_KEY, false),
  )

  const setCompactMode = (next: boolean) => {
    setCompactModeState(next)
    sessionStore.set(STORAGE_KEY, next)
  }

  const value = useMemo(
    () => ({ compactMode, setCompactMode }),
    [compactMode],
  )

  return (
    <SessionPreferencesContext.Provider value={value}>
      {children}
    </SessionPreferencesContext.Provider>
  )
}

export function useSessionPreferences() {
  const ctx = useContext(SessionPreferencesContext)
  if (!ctx) {
    throw new Error(
      'useSessionPreferences must be used within SessionPreferencesProvider',
    )
  }

  return ctx
}
