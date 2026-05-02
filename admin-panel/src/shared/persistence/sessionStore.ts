export const sessionStore = {
  get<T>(key: string, fallback: T): T {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return fallback

    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): void {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  },

  remove(key: string): void {
    window.sessionStorage.removeItem(key)
  },
}
