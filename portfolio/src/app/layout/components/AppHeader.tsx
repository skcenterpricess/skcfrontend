import { Link, NavLink } from 'react-router-dom'
import type { MutableRefObject } from 'react'

interface NavItem {
  to: string
  label: string
}

interface AppHeaderProps {
  isAuthenticated: boolean
  isLeadLoggedIn: boolean
  compactMode: boolean
  setCompactMode: (value: boolean) => void
  isMenuOpen: boolean
  setIsMenuOpen: (value: boolean) => void
  isAccountMenuOpen: boolean
  setIsAccountMenuOpen: (value: boolean) => void
  accountMenuRef: MutableRefObject<HTMLDivElement | null>
  firstLetter: string
  profileUpdatePath: string
  onLogout: () => void | Promise<void>
  navItems: NavItem[]
}

function CartLink({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/cart"
      className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-700 transition hover:bg-brand-100"
      aria-label="Open cart"
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 3h2l.4 2M7 13h10l4-8H6.4" />
        <path d="M7 13 5.4 5H3" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
      </svg>
    </Link>
  )
}

function AccountMenu({
  isAccountMenuOpen,
  setIsAccountMenuOpen,
  firstLetter,
  profileUpdatePath,
  showDashboardLink,
  onLogout,
  isMobile,
  onAfterAction,
}: {
  isAccountMenuOpen: boolean
  setIsAccountMenuOpen: (value: boolean) => void
  firstLetter: string
  profileUpdatePath: string
  showDashboardLink: boolean
  onLogout: () => void | Promise<void>
  isMobile?: boolean
  onAfterAction?: () => void
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
        className={`flex items-center justify-center rounded-full bg-brand-700 font-bold text-white ${
          isMobile ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
        }`}
        aria-label="Open account menu"
        aria-expanded={isAccountMenuOpen}
      >
        {firstLetter}
      </button>
      {isAccountMenuOpen ? (
        <div
          className={`absolute z-40 w-48 overflow-hidden rounded-xl border border-brand-200 bg-white p-2 shadow-xl ${
            isMobile ? 'left-0 top-10' : 'right-0 top-11'
          }`}
        >
          <Link
            className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            to={profileUpdatePath}
            onClick={() => {
              setIsAccountMenuOpen(false)
              onAfterAction?.()
            }}
          >
            Update Profile
          </Link>
          {showDashboardLink ? (
            <Link
              className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
              to="/dashboard"
              onClick={() => {
                setIsAccountMenuOpen(false)
                onAfterAction?.()
              }}
            >
              Dashboard
            </Link>
          ) : null}
          <button
            type="button"
            className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-700 hover:bg-brand-50"
            onClick={async () => {
              await onLogout()
              onAfterAction?.()
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </>
  )
}

export function AppHeader({
  isAuthenticated,
  isLeadLoggedIn,
  compactMode,
  setCompactMode,
  isMenuOpen,
  setIsMenuOpen,
  isAccountMenuOpen,
  setIsAccountMenuOpen,
  accountMenuRef,
  firstLetter,
  profileUpdatePath,
  onLogout,
  navItems,
}: AppHeaderProps) {
  return (
    <header className="sticky top-3 z-30 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-sm font-black text-white shadow-sm">
            SK
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black uppercase text-brand-900 sm:text-xl">SKC Enterprises</h1>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-600">Let&apos;s build something strong</p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>

        <div className="hidden items-center gap-2 text-sm lg:flex">
          <button
            className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-800 hover:bg-slate-50"
            onClick={() => setCompactMode(!compactMode)}
          >
            Compact: {compactMode ? 'On' : 'Off'}
          </button>
          {isAuthenticated || isLeadLoggedIn ? (
            <div className="relative flex items-center" ref={accountMenuRef}>
              <CartLink />
              <AccountMenu
                isAccountMenuOpen={isAccountMenuOpen}
                setIsAccountMenuOpen={setIsAccountMenuOpen}
                firstLetter={firstLetter}
                profileUpdatePath={profileUpdatePath}
                showDashboardLink={isAuthenticated || isLeadLoggedIn}
                onLogout={onLogout}
              />
            </div>
          ) : (
            <>
              <Link className="rounded-md bg-brand-700 px-3 py-1.5 font-medium text-white hover:bg-brand-800" to="/lead/login">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      <div className={`${isMenuOpen ? 'mt-4 grid' : 'hidden'} gap-2 lg:hidden`}>
        <nav className="grid gap-2 text-sm">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 font-medium transition ${
                  isActive ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-2 flex items-center gap-2 text-sm">
          <button
            className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-800 hover:bg-slate-50"
            onClick={() => setCompactMode(!compactMode)}
          >
            Compact: {compactMode ? 'On' : 'Off'}
          </button>
          {isAuthenticated || isLeadLoggedIn ? (
            <div className="relative flex items-center" ref={accountMenuRef}>
              <CartLink onClick={() => setIsMenuOpen(false)} />
              <AccountMenu
                isAccountMenuOpen={isAccountMenuOpen}
                setIsAccountMenuOpen={setIsAccountMenuOpen}
                firstLetter={firstLetter}
                profileUpdatePath={profileUpdatePath}
                showDashboardLink={isAuthenticated || isLeadLoggedIn}
                onLogout={onLogout}
                isMobile
                onAfterAction={() => setIsMenuOpen(false)}
              />
            </div>
          ) : (
            <>
              <Link className="rounded-md bg-brand-700 px-3 py-1.5 font-medium text-white hover:bg-brand-800" to="/lead/login">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      <nav
        className="mt-4 hidden gap-2 text-sm lg:grid"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-center font-semibold transition ${
                isActive ? 'bg-brand-700 text-white shadow' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
