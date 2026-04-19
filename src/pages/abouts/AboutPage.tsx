import { useEffect, useState } from 'react'
import { useContent } from '@/features/content/context/ContentContext'
import { httpClient } from '@/shared/api/httpClient'
import type { Achievement } from '@/shared/types/content'

export default function AboutPage() {
  const { topAchievements, isLoading: contextLoading } = useContent()
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to fetch all achievements from API
        try {
          const response = await httpClient.get<{ success: boolean; records: Achievement[] }>(
            '/achievement?limit=100&page=1'
          )
          if (response.data.records?.length) {
            setAllAchievements(response.data.records)
            return
          }
        } catch {
          // Fallback to context achievements if API fails or returns nothing
        }

        // Use featured achievements as fallback
        if (topAchievements.length > 0) {
          setAllAchievements(topAchievements)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load achievements')
      } finally {
        setIsLoading(false)
      }
    }

    loadAchievements()
  }, [topAchievements])

  const displayAchievements = allAchievements.length > 0 ? allAchievements : topAchievements

  return (
    <section className="space-y-8 pb-4">
      {/* Hero Section */}
      <div className="rounded-[2.25rem] bg-gradient-to-br from-cyan-50 to-slate-100 px-6 py-10 sm:px-8 lg:px-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
            About Our Work
          </p>
          <h1 className="text-4xl font-black text-slate-950 sm:text-5xl">
            Achievements that showcase our commitment to excellence
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            We measure success through milestones, results, and the trust our clients place in us. 
            Every achievement below represents dedication, creativity, and a focus on delivering 
            measurable impact.
          </p>
        </div>
      </div>

      {/* Achievements Gallery */}
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Our Milestones
          </p>
          <h2 className="text-3xl font-black text-slate-950">Achievements & Impact</h2>
        </div>

        <div>
          {isLoading && contextLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200" />
                  <div className="mt-4 h-6 w-3/4 animate-pulse rounded-lg bg-slate-200" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded-lg bg-slate-100" />
                    <div className="h-4 w-5/6 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error || displayAchievements.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto max-w-sm">
                <svg
                  className="mx-auto h-12 w-12 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p className="mt-4 text-slate-600">
                  {error ? error : 'No achievements available yet.'}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Check back soon for our latest milestones and wins.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayAchievements.map((achievement, index) => (
                <article
                  key={achievement._id}
                  className="group rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-lg font-black text-white shadow-lg">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    {achievement.value && (
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                        {achievement.value}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-950 group-hover:text-cyan-700 transition">
                    {achievement.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {achievement.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full bg-slate-50 px-2.5 py-1 font-medium">
                      Milestone
                    </span>
                    {achievement.value && (
                      <span className="rounded-full bg-cyan-50 px-2.5 py-1 font-medium text-cyan-700">
                        +{achievement.value}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Achievements', value: displayAchievements.length },
          { label: 'Portfolio Projects', value: '20+' },
          { label: 'Client Satisfaction', value: '99%' },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-[1.4rem] border border-slate-200 bg-white/70 px-6 py-6 text-center backdrop-blur"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              {stat.value}
            </p>
          </div>
        ))}
      </section>
    </section>
  )
}
