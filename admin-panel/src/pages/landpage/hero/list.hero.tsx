import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contentService } from '@/features/content/services/contentService'
import type { HeaderSidebar } from '@/shared/types/content'

function normalizeError(err: unknown, fallback: string): string {
  const maybeError = err as {
    message?: string
    response?: { status?: number; data?: { message?: string } }
  }

  const status = maybeError.response?.status
  if (status === 400) return maybeError.response?.data?.message || 'Please check the form fields and try again'
  if (status === 401) return 'Your session expired. Please login again'
  if (status === 403) return 'Only superadmin can perform this action'
  if (!status && maybeError.message) return 'Network error or CORS issue. Please check backend URL and CORS config'
  return maybeError.message || fallback
}

export default function ListHeroPage() {
  const navigate = useNavigate()
  const [headerSidebars, setHeaderSidebars] = useState<HeaderSidebar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [refreshTick, setRefreshTick] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 1 })
  const [viewTarget, setViewTarget] = useState<HeaderSidebar | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await contentService.listHeaderSidebar({
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
        refresh: refreshTick > 0,
      })
      setHeaderSidebars(data.records)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(normalizeError(err, 'Failed to load header sliders'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, limit, search, sortBy, sortOrder, refreshTick])

  const onDelete = async (id: string) => {
    const shouldDelete = window.confirm('Delete this header slider?')
    if (!shouldDelete) return

    try {
      await contentService.deleteHeaderSidebar(id)
      setRefreshTick((prev) => prev + 1)
      setError(null)
    } catch (err) {
      setError(normalizeError(err, 'Failed to delete header slider'))
    }
  }

  if (loading && headerSidebars.length === 0) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm">Loading header sliders...</div>
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Header Slider</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setRefreshTick((prev) => prev + 1)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate('/content/header-slider/create')}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
          >
            Create
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-4">
        <input
          placeholder="Search headers"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
          <option value="heading">Heading</option>
        </select>
        <select
          value={sortOrder}
          onChange={(event) => {
            setSortOrder(event.target.value as 'asc' | 'desc')
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <select
          value={String(limit)}
          onChange={(event) => {
            setLimit(Number(event.target.value))
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="5">5 / page</option>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
        </select>
      </div>

      {error ? <p className="mb-4 rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      {headerSidebars.length === 0 ? (
        <p className="text-slate-600">No header sidebars yet.</p>
      ) : (
        <div className="space-y-4">
          {headerSidebars.map((header) => (
            <div key={header._id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex gap-4">
                {header.image ? (
                  <img src={header.image} alt={header.heading} className="h-20 w-20 rounded object-cover" />
                ) : null}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{header.heading}</h3>
                  <p className="mt-1 text-sm text-slate-600">{header.description}</p>
                  <p className="mt-2 text-xs text-slate-500">Updated: {new Date(header.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewTarget(header)}
                    className="rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/content/header-slider/edit/${header._id}`, { state: { header } })}
                    className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(header._id)}
                    className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <p>Page {pagination.page} of {pagination.pages} | Total {pagination.total}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
            disabled={pagination.page >= pagination.pages}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {viewTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl space-y-3 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900">Header Slider Details</h3>
            <p className="text-sm text-slate-600"><span className="font-medium">Heading:</span> {viewTarget.heading}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Description:</span> {viewTarget.description}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Image:</span> {viewTarget.image}</p>
            <div className="flex justify-end">
              <button onClick={() => setViewTarget(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
