import type { Achievement } from '@/shared/types/content'
import { sectionShell } from '@/pages/home/constants'

interface AchievementsSectionProps {
  isLoading: boolean
  achievements: Achievement[]
}

export function AchievementsSection({ isLoading, achievements }: AchievementsSectionProps) {
  const loadingCards = Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="rounded-[1.4rem] border border-brand-100 bg-white p-5 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded-full bg-brand-100" />
      <div className="mt-3 h-6 w-3/4 animate-pulse rounded-full bg-brand-100" />
      <div className="mt-4 h-16 animate-pulse rounded-2xl bg-surface-100" />
    </div>
  ))

  return (
    <section className={sectionShell}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Achievements</p>
          <h2 className="mt-2 text-3xl font-black text-brand-900">Proof that builds trust fast</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-brand-700">
          Wins and milestones are presented as compact cards so the page feels credible at a glance.
        </p>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{loadingCards}</div>
        ) : achievements.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement, index) => (
              <article key={achievement._id} className="rounded-[1.4rem] border border-brand-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-brand-700 text-sm font-black text-white">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {achievement.value && (
                    <span className="rounded-full bg-brand-800 px-3 py-1 text-xs font-semibold text-white">
                      {achievement.value}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-brand-900">{achievement.title}</h3>
                <p className="mt-3 text-sm leading-6 text-brand-700">{achievement.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-brand-200 bg-surface-100 px-6 py-10 text-center text-brand-700">
            Achievement highlights will show here once active records are available.
          </div>
        )}
      </div>
    </section>
  )
}
