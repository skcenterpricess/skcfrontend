import { NavLink } from 'react-router-dom'
import type { SidebarSection } from './sidebarConfig'

interface SidebarSectionProps {
  section: SidebarSection
  isOpen: boolean
  onToggle: () => void
}

export function SidebarSection({ section, isOpen, onToggle }: SidebarSectionProps) {
  const contentId = `sidebar-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <section className="space-y-2 rounded-xl border border-white/5 bg-white/[0.03] p-2">
      {section.collapsible ? (
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <span>{section.title}</span>
          <svg
            className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.512a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <p className="px-3 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {section.title}
        </p>
      )}

      <div id={contentId} className={`${isOpen ? 'grid' : 'hidden'} gap-1.5`}>
        {section.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]'
                  : 'border-transparent bg-transparent text-slate-200 hover:border-white/10 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>{item.label}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    isActive ? 'bg-emerald-300' : 'bg-transparent group-hover:bg-slate-400'
                  }`}
                  aria-hidden="true"
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </section>
  )
}