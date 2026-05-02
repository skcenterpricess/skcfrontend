import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderService } from '@/features/orders/services/orderService'
import type { Order, OrderStatus } from '@/shared/types/order'

const statusOptions: OrderStatus[] = [
  'waiting_for_sales_contact',
  'contacted',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
]

const sortByOptions: Array<{ label: string; value: 'createdAt' | 'updatedAt' | 'subtotal' | 'status' }> = [
  { label: 'Created At', value: 'createdAt' },
  { label: 'Updated At', value: 'updatedAt' },
  { label: 'Subtotal', value: 'subtotal' },
  { label: 'Status', value: 'status' },
]

const formatStatus = (status: OrderStatus) => status.replaceAll('_', ' ')

const toIsoDayStart = (date: string) => `${date}T00:00:00.000Z`
const toIsoDayEnd = (date: string) => `${date}T23:59:59.999Z`

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [city, setCity] = useState('')
  const [createdAfter, setCreatedAfter] = useState('')
  const [createdBefore, setCreatedBefore] = useState('')
  const [minTotal, setMinTotal] = useState('')
  const [maxTotal, setMaxTotal] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'subtotal' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [refreshTick, setRefreshTick] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })

  const [statusEditorOpen, setStatusEditorOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<Order | null>(null)
  const [nextStatus, setNextStatus] = useState<OrderStatus>('waiting_for_sales_contact')
  const [salesNote, setSalesNote] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.list({
        page,
        limit,
        search: search || undefined,
        status: (status || undefined) as OrderStatus | undefined,
        city: city || undefined,
        createdAfter: createdAfter ? toIsoDayStart(createdAfter) : undefined,
        createdBefore: createdBefore ? toIsoDayEnd(createdBefore) : undefined,
        minTotal: minTotal ? Number(minTotal) : undefined,
        maxTotal: maxTotal ? Number(maxTotal) : undefined,
        sortBy,
        sortOrder,
        refresh: refreshTick > 0,
      })

      setOrders(response.records)
      setPagination(response.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [
    page,
    limit,
    search,
    status,
    city,
    createdAfter,
    createdBefore,
    minTotal,
    maxTotal,
    sortBy,
    sortOrder,
    refreshTick,
  ])

  const modalTitle = useMemo(() => {
    if (!statusTarget) {
      return 'Update Order Status'
    }

    return `Update Status (${statusTarget._id.slice(-8)})`
  }, [statusTarget])

  const openStatusEditor = (order: Order) => {
    setStatusTarget(order)
    setNextStatus(order.status)
    setSalesNote(order.salesNote || '')
    setStatusEditorOpen(true)
  }

  const closeStatusEditor = () => {
    if (isUpdatingStatus) {
      return
    }

    setStatusEditorOpen(false)
    setStatusTarget(null)
    setSalesNote('')
    setNextStatus('waiting_for_sales_contact')
  }

  const onUpdateStatus = async (event: FormEvent) => {
    event.preventDefault()
    if (!statusTarget || isUpdatingStatus) {
      return
    }

    try {
      setIsUpdatingStatus(true)
      await orderService.updateStatus(statusTarget._id, {
        status: nextStatus,
        salesNote: salesNote.trim(),
      })
      closeStatusEditor()
      setRefreshTick((previous) => previous + 1)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const onResetFilters = () => {
    setSearch('')
    setStatus('')
    setCity('')
    setCreatedAfter('')
    setCreatedBefore('')
    setMinTotal('')
    setMaxTotal('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setLimit(10)
    setPage(1)
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">Loading orders...</div>
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Orders</h2>
          <p className="mt-2 text-sm text-slate-600">Track, filter, and update order workflow for sales operations.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onResetFilters}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Reset
          </button>
          <button
            onClick={() => setRefreshTick((previous) => previous + 1)}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-3 lg:grid-cols-4">
        <input
          placeholder="Search id, customer, phone, city, status"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {formatStatus(item)}
            </option>
          ))}
        </select>

        <input
          placeholder="City"
          value={city}
          onChange={(event) => {
            setCity(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value as 'createdAt' | 'updatedAt' | 'subtotal' | 'status')
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {sortByOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
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

        <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          Created After
          <input
            type="date"
            value={createdAfter}
            onChange={(event) => {
              setCreatedAfter(event.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm normal-case tracking-normal"
          />
        </label>

        <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          Created Before
          <input
            type="date"
            value={createdBefore}
            onChange={(event) => {
              setCreatedBefore(event.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm normal-case tracking-normal"
          />
        </label>

        <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          Min Total
          <input
            type="number"
            min={0}
            value={minTotal}
            onChange={(event) => {
              setMinTotal(event.target.value)
              setPage(1)
            }}
            placeholder="0"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm normal-case tracking-normal"
          />
        </label>

        <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-slate-600">
          Max Total
          <input
            type="number"
            min={0}
            value={maxTotal}
            onChange={(event) => {
              setMaxTotal(event.target.value)
              setPage(1)
            }}
            placeholder="100000"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm normal-case tracking-normal"
          />
        </label>

        <select
          value={String(limit)}
          onChange={(event) => {
            setLimit(Number(event.target.value))
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>
      </div>

      {error ? <p className="mt-4 rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      {orders.length === 0 ? (
        <p className="mt-6 text-slate-600">No orders found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Items</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => {
                const lead = typeof order.leadId === 'string' ? null : order.leadId
                const shippingAddress = typeof order.shippingAddress === 'string' ? null : order.shippingAddress
                return (
                  <tr key={order._id} className="bg-white">
                    <td className="px-3 py-3 font-medium text-slate-900">#{order._id.slice(-8)}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <p className="font-medium">{lead?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{lead?.email || 'No email'}</p>
                      <p className="text-xs text-slate-500">{lead?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{shippingAddress?.city || 'N/A'}</td>
                    <td className="px-3 py-3 text-slate-700">{order.totalItems}</td>
                    <td className="px-3 py-3 font-medium text-slate-900">INR {order.subtotal.toFixed(2)}</td>
                    <td className="px-3 py-3 text-slate-700">{formatStatus(order.status)}</td>
                    <td className="px-3 py-3 text-slate-700">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/orders/view/${order._id}`)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openStatusEditor(order)}
                          className="rounded border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
        <p>
          Page {pagination.page} of {pagination.pages} | Total {pagination.total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((previous) => Math.min(pagination.pages, previous + 1))}
            disabled={pagination.page >= pagination.pages}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {statusEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={closeStatusEditor}>
          <form
            onSubmit={onUpdateStatus}
            className="w-full max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-slate-900">{modalTitle}</h3>

            <label className="block text-sm font-medium text-slate-700">
              Status
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {formatStatus(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Sales Note
              <textarea
                rows={4}
                value={salesNote}
                onChange={(event) => setSalesNote(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Add optional update notes for this order"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeStatusEditor}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                disabled={isUpdatingStatus}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}
