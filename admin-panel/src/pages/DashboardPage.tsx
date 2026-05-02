import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { contentService } from '@/features/content/services/contentService'
import type { HeaderSidebar, Testimonial } from '@/shared/types/content'

export default function DashboardPage() {
  const { user } = useAuth()
  const isSuperadmin = user?.role === 'superadmin'
  const [headerSidebars, setHeaderSidebars] = useState<HeaderSidebar[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [headerData, testimonialData] = await Promise.all([
          contentService.listHeaderSidebar({ limit: 3 }),
          contentService.listTestimonials({ limit: 3, isActive: true })
        ])
        setHeaderSidebars(headerData.records)
        setTestimonials(testimonialData.records)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard insights')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h2>
        <p className="mt-3 text-slate-600">
          Welcome back {user?.name ?? 'Admin'}. This panel is protected by admin role guard.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
            <p className="mt-1 text-lg font-semibold capitalize text-slate-900">{user?.role || 'admin'}</p>
          </article>
          <article className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Hero Slides</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{headerSidebars.length}</p>
          </article>
          <article className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Active Testimonials</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{testimonials.length}</p>
          </article>
          <article className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Data Status</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{loading ? 'Loading' : error ? 'Partial' : 'Ready'}</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h3 className="mb-4 text-xl font-semibold text-slate-900">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/products"
            className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-900">Manage Products</p>
            <p className="mt-1 text-xs text-slate-600">Create, edit, and maintain catalog listings.</p>
          </Link>
          <Link
            to="/leads"
            className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-900">Review Leads</p>
            <p className="mt-1 text-xs text-slate-600">Track lead lifecycle and update follow-up status.</p>
          </Link>
          <Link
            to="/contact"
            className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-900">Contact Inbox</p>
            <p className="mt-1 text-xs text-slate-600">Review messages received from website contact forms.</p>
          </Link>
          <Link
            to="/settings"
            className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-900">Session Settings</p>
            <p className="mt-1 text-xs text-slate-600">Manage account session and interface preferences.</p>
          </Link>
        </div>
      </section>

      {isSuperadmin ? (
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-xl font-semibold text-slate-900">Quick Add</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              to="/content/testimonials"
              className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">New Testimonial</p>
              <p className="mt-1 text-xs text-slate-600">Add and publish a customer quote.</p>
            </Link>
            <Link
              to="/content/achievements"
              className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">New Achievement</p>
              <p className="mt-1 text-xs text-slate-600">Add a new win or milestone item.</p>
            </Link>
            <Link
              to="/content/header-slider"
              className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">New Hero Slider</p>
              <p className="mt-1 text-xs text-slate-600">Add a new homepage hero slide.</p>
            </Link>
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
          <p className="mt-2 text-sm text-slate-600">
            Dashboard shortcuts remain available. Content widgets will populate once data loads successfully.
          </p>
        </section>
      ) : null}

      {loading ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Loading dashboard insights...</p>
        </section>
      ) : null}

      {!loading && (
        <>
          {headerSidebars.length > 0 ? (
            <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-4 text-xl font-semibold text-slate-900">Recent Headers</h3>
              <div className="space-y-3">
                {headerSidebars.map((header) => (
                  <div key={header._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                    <div>
                      <p className="font-medium text-slate-900">{header.heading}</p>
                      <p className="text-sm text-slate-600">{header.description.substring(0, 60)}...</p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(header.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Recent Headers</h3>
              <p className="mt-2 text-sm text-slate-600">No header slider entries available yet.</p>
            </section>
          )}

          {testimonials.length > 0 ? (
            <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-4 text-xl font-semibold text-slate-900">Active Testimonials</h3>
              <div className="space-y-3">
                {testimonials.map((testimonial) => (
                  <div key={testimonial._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                    <div>
                      <p className="font-medium text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.designation}</p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(testimonial.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Active Testimonials</h3>
              <p className="mt-2 text-sm text-slate-600">No active testimonials available yet.</p>
            </section>
          )}
        </>
      )}
    </div>
  )
}
