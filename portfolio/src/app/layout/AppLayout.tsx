import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useSessionPreferences } from '@/app/providers/SessionPreferencesProvider'
import { leadAuthService } from '@/features/leads/services/leadAuthService'
import { AppHeader } from '@/app/layout/components/AppHeader'
import { AppFooter } from '@/app/layout/components/AppFooter'

const LEAD_SESSION_KEY = 'portfolio.lead.session'
const LEAD_SESSION_EVENT = 'lead:session:changed'

interface LeadSessionUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'lead'
}

export default function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth()
  const { compactMode, setCompactMode } = useSessionPreferences()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [leadSessionUser, setLeadSessionUser] = useState<LeadSessionUser | null>(null)

  useEffect(() => {
    const loadLeadSession = () => {
      try {
        const raw = sessionStorage.getItem(LEAD_SESSION_KEY)
        if (!raw) {
          setLeadSessionUser(null)
          return
        }
        setLeadSessionUser(JSON.parse(raw) as LeadSessionUser)
      } catch {
        setLeadSessionUser(null)
      }
    }

    loadLeadSession()
    window.addEventListener(LEAD_SESSION_EVENT, loadLeadSession)
    return () => window.removeEventListener(LEAD_SESSION_EVENT, loadLeadSession)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('[data-account-menu-root="true"]')) {
        return
      }

      setIsAccountMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const isLeadLoggedIn = !!leadSessionUser

  const displayName = useMemo(() => {
    if (isLeadLoggedIn && leadSessionUser?.name) {
      return leadSessionUser.name
    }
    if (isAuthenticated && user?.name) {
      return user.name
    }
    return ''
  }, [isAuthenticated, isLeadLoggedIn, leadSessionUser?.name, user?.name])

  const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'U'
  const profileUpdatePath = isLeadLoggedIn ? '/lead/profile' : '/dashboard'

  const onLogout = async () => {
    if (isAuthenticated) {
      await logout()
      return
    }
    if (isLeadLoggedIn) {
      await leadAuthService.logout()
    }
    setIsAccountMenuOpen(false)
  }

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,130,32,0.14),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(234,88,12,0.12),transparent_38%),linear-gradient(180deg,#f8fafc,#f1f5f9)] px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <AppHeader
          isAuthenticated={isAuthenticated}
          isLeadLoggedIn={isLeadLoggedIn}
          compactMode={compactMode}
          setCompactMode={setCompactMode}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isAccountMenuOpen={isAccountMenuOpen}
          setIsAccountMenuOpen={setIsAccountMenuOpen}
          firstLetter={firstLetter}
          profileUpdatePath={profileUpdatePath}
          onLogout={onLogout}
          navItems={navItems}
        />

        <main className={`${compactMode ? 'space-y-3' : 'space-y-5'} flex-1 rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_14px_40px_rgba(194,65,12,0.14)] sm:p-4`}>
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </div>
  )
}
