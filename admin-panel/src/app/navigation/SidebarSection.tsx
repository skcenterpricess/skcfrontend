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
    <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-2.5">
      {section.collapsible ? (
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-300/90 transition hover:bg-white/10 hover:text-slate-100"
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
        <p className="px-3 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-300/90">
          {section.title}
        </p>
      )}

      <div id={contentId} className={`${isOpen ? 'grid' : 'hidden'} gap-1.5 px-1`}>
        {section.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.2)]'
                  : 'border-transparent bg-transparent text-slate-200 hover:border-white/15 hover:bg-white/10 hover:text-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="truncate">{item.label}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    isActive ? 'bg-cyan-300' : 'bg-transparent group-hover:bg-slate-300'
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