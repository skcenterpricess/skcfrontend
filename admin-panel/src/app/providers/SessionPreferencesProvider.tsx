import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { sessionStore } from '@/shared/persistence/sessionStore'

export type ThemeMode = 'light' | 'dark'

interface SessionPreferencesValue {
  compactMode: boolean
  themeMode: ThemeMode
  setCompactMode: (next: boolean) => void
  setThemeMode: (next: ThemeMode) => void
}

interface StoredPreferences {
  compactMode: boolean
  themeMode: ThemeMode
}

const STORAGE_KEY = 'admin-ui-preferences'
const DEFAULT_PREFERENCES: StoredPreferences = {
  compactMode: false,
  themeMode: 'light',
}

const THEME_MODES: ThemeMode[] = ['light', 'dark']

const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === 'string' && THEME_MODES.includes(value as ThemeMode)

const normalizeThemeMode = (value: unknown): ThemeMode => {
  if (isThemeMode(value)) {
    return value
  }

  if (value === 'midnight') {
    return 'dark'
  }

  return 'light'
}

const getInitialPreferences = (): StoredPreferences => {
  const stored = sessionStore.get<StoredPreferences | { compactMode?: boolean; themePreset?: string } | boolean>(
    STORAGE_KEY,
    DEFAULT_PREFERENCES,
  )

  if (typeof stored === 'boolean') {
    return {
      ...DEFAULT_PREFERENCES,
      compactMode: stored,
    }
  }

  return {
    compactMode: Boolean(stored.compactMode),
    themeMode: normalizeThemeMode(
      'themeMode' in stored ? stored.themeMode : stored.themePreset,
    ),
  }
}

const SessionPreferencesContext = createContext<SessionPreferencesValue | undefined>(
  undefined,
)

export function SessionPreferencesProvider({
  children,
}: {
  children: ReactNode
}) {
  const [preferences, setPreferences] = useState<StoredPreferences>(
    getInitialPreferences,
  )

  const setCompactMode = (next: boolean) => {
    setPreferences((previous) => {
      const updated = {
        ...previous,
        compactMode: next,
      }
      sessionStore.set(STORAGE_KEY, updated)
      return updated
    })
  }

  const setThemeMode = (next: ThemeMode) => {
    setPreferences((previous) => {
      const updated = {
        ...previous,
        themeMode: next,
      }
      sessionStore.set(STORAGE_KEY, updated)
      return updated
    })
  }

  const value = useMemo(
    () => ({
      compactMode: preferences.compactMode,
      themeMode: preferences.themeMode,
      setCompactMode,
      setThemeMode,
    }),
    [preferences],
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
