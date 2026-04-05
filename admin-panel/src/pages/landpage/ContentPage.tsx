import { useEffect, useState } from 'react'
import { contentService } from '@/features/content/services/contentService'
import type { Achievement, HeaderSidebar, Testimonial } from '@/shared/types/content'

export default function ContentPage() {
  const [headerSidebars, setHeaderSidebars] = useState<HeaderSidebar[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  const [headerSearch, setHeaderSearch] = useState('')
  const [headerSortBy, setHeaderSortBy] = useState('createdAt')
  const [headerSortOrder, setHeaderSortOrder] = useState<'asc' | 'desc'>('desc')
  const [headerPage, setHeaderPage] = useState(1)
  const [headerLimit, setHeaderLimit] = useState(5)
  const [headerPagination, setHeaderPagination] = useState({ page: 1, limit: 5, total: 0, pages: 1 })

  const [testimonialSearch, setTestimonialSearch] = useState('')
  const [testimonialSortBy, setTestimonialSortBy] = useState('createdAt')
  const [testimonialSortOrder, setTestimonialSortOrder] = useState<'asc' | 'desc'>('desc')
  const [testimonialStatus, setTestimonialStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [testimonialPage, setTestimonialPage] = useState(1)
  const [testimonialLimit, setTestimonialLimit] = useState(5)
  const [testimonialPagination, setTestimonialPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1,
  })

  const [achievementSearch, setAchievementSearch] = useState('')
  const [achievementSortBy, setAchievementSortBy] = useState('createdAt')
  const [achievementSortOrder, setAchievementSortOrder] = useState<'asc' | 'desc'>('desc')
  const [achievementStatus, setAchievementStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [achievementPage, setAchievementPage] = useState(1)
  const [achievementLimit, setAchievementLimit] = useState(5)
  const [achievementPagination, setAchievementPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [headerData, testimonialData, achievementData] = await Promise.all([
        contentService.listHeaderSidebar({
          page: headerPage,
          limit: headerLimit,
          search: headerSearch || undefined,
          sortBy: headerSortBy,
          sortOrder: headerSortOrder,
          refresh: refreshTick > 0,
        }),
        contentService.listTestimonials({
          page: testimonialPage,
          limit: testimonialLimit,
          search: testimonialSearch || undefined,
          sortBy: testimonialSortBy,
          sortOrder: testimonialSortOrder,
          isActive:
            testimonialStatus === 'all' ? undefined : testimonialStatus === 'active',
          refresh: refreshTick > 0,
        }),
        contentService.listAchievements({
          page: achievementPage,
          limit: achievementLimit,
          search: achievementSearch || undefined,
          sortBy: achievementSortBy,
          sortOrder: achievementSortOrder,
          isActive:
            achievementStatus === 'all' ? undefined : achievementStatus === 'active',
          refresh: refreshTick > 0,
        }),
      ])
      setHeaderSidebars(headerData.records)
      setTestimonials(testimonialData.records)
      setAchievements(achievementData.records)
      setHeaderPagination(headerData.pagination)
      setTestimonialPagination(testimonialData.pagination)
      setAchievementPagination(achievementData.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [
    headerPage,
    headerLimit,
    headerSearch,
    headerSortBy,
    headerSortOrder,
    testimonialPage,
    testimonialLimit,
    testimonialSearch,
    testimonialSortBy,
    testimonialSortOrder,
    testimonialStatus,
    achievementPage,
    achievementLimit,
    achievementSearch,
    achievementSortBy,
    achievementSortOrder,
    achievementStatus,
    refreshTick,
  ])

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Header Sidebars</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setRefreshTick((prev) => prev + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Refresh
            </button>
            <button className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white">
              New Header
            </button>
          </div>
        </div>
        <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-4">
          <input
            placeholder="Search headers"
            value={headerSearch}
            onChange={(event) => {
              setHeaderSearch(event.target.value)
              setHeaderPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={headerSortBy}
            onChange={(event) => {
              setHeaderSortBy(event.target.value)
              setHeaderPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
            <option value="heading">Heading</option>
          </select>
          <select
            value={headerSortOrder}
            onChange={(event) => {
              setHeaderSortOrder(event.target.value as 'asc' | 'desc')
              setHeaderPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <select
            value={String(headerLimit)}
            onChange={(event) => {
              setHeaderLimit(Number(event.target.value))
              setHeaderPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="5">5 / page</option>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
          </select>
        </div>
        {error && <p className="mb-4 text-red-600">{error}</p>}
        {headerSidebars.length === 0 ? (
          <p className="text-slate-600">No header sidebars yet.</p>
        ) : (
          <div className="space-y-4">
            {headerSidebars.map((header) => (
              <div key={header._id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex gap-4">
                  {header.image && (
                    <img
                      src={header.image}
                      alt={header.heading}
                      className="h-20 w-20 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{header.heading}</h3>
                    <p className="mt-1 text-sm text-slate-600">{header.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Updated: {new Date(header.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50">
                      Edit
                    </button>
                    <button className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>
            Page {headerPagination.page} of {headerPagination.pages} | Total {headerPagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setHeaderPage((prev) => Math.max(1, prev - 1))}
              disabled={headerPagination.page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setHeaderPage((prev) => Math.min(headerPagination.pages, prev + 1))}
              disabled={headerPagination.page >= headerPagination.pages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Testimonials</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setRefreshTick((prev) => prev + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Refresh
            </button>
            <button className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white">
              New Testimonial
            </button>
          </div>
        </div>
        <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-5">
          <input
            placeholder="Search testimonials"
            value={testimonialSearch}
            onChange={(event) => {
              setTestimonialSearch(event.target.value)
              setTestimonialPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={testimonialStatus}
            onChange={(event) => {
              setTestimonialStatus(event.target.value as 'all' | 'active' | 'inactive')
              setTestimonialPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={testimonialSortBy}
            onChange={(event) => {
              setTestimonialSortBy(event.target.value)
              setTestimonialPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
            <option value="name">Name</option>
          </select>
          <select
            value={testimonialSortOrder}
            onChange={(event) => {
              setTestimonialSortOrder(event.target.value as 'asc' | 'desc')
              setTestimonialPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <select
            value={String(testimonialLimit)}
            onChange={(event) => {
              setTestimonialLimit(Number(event.target.value))
              setTestimonialPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="5">5 / page</option>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
          </select>
        </div>
        {testimonials.length === 0 ? (
          <p className="text-slate-600">No testimonials yet.</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial._id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex gap-4">
                  {testimonial.image && (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{testimonial.name}</h3>
                        <p className="text-sm text-slate-600">{testimonial.designation}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          testimonial.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{testimonial.message}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Updated: {new Date(testimonial.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50">
                      Edit
                    </button>
                    <button className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>
            Page {testimonialPagination.page} of {testimonialPagination.pages} | Total {testimonialPagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setTestimonialPage((prev) => Math.max(1, prev - 1))}
              disabled={testimonialPagination.page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setTestimonialPage((prev) => Math.min(testimonialPagination.pages, prev + 1))
              }
              disabled={testimonialPagination.page >= testimonialPagination.pages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Achievements</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setRefreshTick((prev) => prev + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Refresh
            </button>
            <button className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white">
              New Achievement
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-5">
          <input
            placeholder="Search achievements"
            value={achievementSearch}
            onChange={(event) => {
              setAchievementSearch(event.target.value)
              setAchievementPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={achievementStatus}
            onChange={(event) => {
              setAchievementStatus(event.target.value as 'all' | 'active' | 'inactive')
              setAchievementPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={achievementSortBy}
            onChange={(event) => {
              setAchievementSortBy(event.target.value)
              setAchievementPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Updated At</option>
            <option value="title">Title</option>
          </select>
          <select
            value={achievementSortOrder}
            onChange={(event) => {
              setAchievementSortOrder(event.target.value as 'asc' | 'desc')
              setAchievementPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <select
            value={String(achievementLimit)}
            onChange={(event) => {
              setAchievementLimit(Number(event.target.value))
              setAchievementPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="5">5 / page</option>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
          </select>
        </div>

        {achievements.length === 0 ? (
          <p className="text-slate-600">No achievements yet.</p>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement._id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex gap-4">
                  {achievement.image && (
                    <img
                      src={achievement.image}
                      alt={achievement.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
                      {achievement.isActive !== undefined ? (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            achievement.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {achievement.isActive ? 'Active' : 'Inactive'}
                        </span>
                      ) : null}
                    </div>
                    {achievement.value ? (
                      <p className="mt-1 text-sm font-medium text-brand-700">{achievement.value}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-slate-600">{achievement.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Updated: {new Date(achievement.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50">
                      Edit
                    </button>
                    <button className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>
            Page {achievementPagination.page} of {achievementPagination.pages} | Total {achievementPagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setAchievementPage((prev) => Math.max(1, prev - 1))}
              disabled={achievementPagination.page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setAchievementPage((prev) => Math.min(achievementPagination.pages, prev + 1))
              }
              disabled={achievementPagination.page >= achievementPagination.pages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
