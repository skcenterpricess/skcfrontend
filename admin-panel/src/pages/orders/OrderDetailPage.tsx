import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

const formatStatus = (status: OrderStatus) => status.replaceAll('_', ' ')

export default function OrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nextStatus, setNextStatus] = useState<OrderStatus>('waiting_for_sales_contact')
  const [salesNote, setSalesNote] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const lead = useMemo(() => {
    if (!order || typeof order.leadId === 'string') {
      return null
    }
    return order.leadId
  }, [order])

  const shippingAddress = useMemo(() => {
    if (!order || typeof order.shippingAddress === 'string') {
      return null
    }
    return order.shippingAddress
  }, [order])

  const loadOrder = async () => {
    if (!id) {
      setError('Order id is missing in route')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await orderService.getById(id)
      setOrder(response)
      setNextStatus(response.status)
      setSalesNote(response.salesNote || '')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [id])

  const onUpdateStatus = async (event: FormEvent) => {
    event.preventDefault()
    if (!id || isUpdatingStatus) {
      return
    }

    try {
      setIsUpdatingStatus(true)
      const updatedOrder = await orderService.updateStatus(id, {
        status: nextStatus,
        salesNote: salesNote.trim(),
      })
      setOrder(updatedOrder)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">Loading order...</div>
  }

  if (!order) {
    return (
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-700">Order not found.</p>
        <button
          onClick={() => navigate('/orders/list')}
          className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
        >
          Back to Orders
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Order #{order._id.slice(-8)}</h2>
          <p className="mt-1 text-sm text-slate-600">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <button
          onClick={() => navigate('/orders/list')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
        >
          Back to Orders
        </button>
      </div>

      {error ? <p className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Customer</h3>
          <p className="mt-3 text-sm text-slate-700">Name: {lead?.name || 'N/A'}</p>
          <p className="text-sm text-slate-700">Email: {lead?.email || 'N/A'}</p>
          <p className="text-sm text-slate-700">Phone: {lead?.phone || 'N/A'}</p>
        </article>

        <article className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Shipping Address</h3>
          <p className="mt-3 text-sm text-slate-700">{shippingAddress?.fullName || 'N/A'}</p>
          <p className="text-sm text-slate-700">{shippingAddress?.phone || ''}</p>
          <p className="text-sm text-slate-700">{shippingAddress?.line1 || ''}</p>
          {shippingAddress?.line2 ? <p className="text-sm text-slate-700">{shippingAddress.line2}</p> : null}
          {shippingAddress?.area ? <p className="text-sm text-slate-700">{shippingAddress.area}</p> : null}
          <p className="text-sm text-slate-700">
            {shippingAddress?.city || ''}, {shippingAddress?.state || ''} {shippingAddress?.pincode || ''}
          </p>
          <p className="text-sm text-slate-700">{shippingAddress?.country || ''}</p>
        </article>
      </div>

      <article className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900">Items</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit Price</th>
                <th className="px-3 py-2">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item, index) => (
                <tr key={`${item.name}-${index}`}>
                  <td className="px-3 py-2 text-slate-700">{item.name}</td>
                  <td className="px-3 py-2 text-slate-700">{item.quantity}</td>
                  <td className="px-3 py-2 text-slate-700">INR {item.unitPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">INR {item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
          <p className="mt-3 text-sm text-slate-700">Total Items: {order.totalItems}</p>
          <p className="text-sm text-slate-700">Subtotal: INR {order.subtotal.toFixed(2)}</p>
          <p className="text-sm text-slate-700">Status: {formatStatus(order.status)}</p>
          <p className="text-sm text-slate-700">Updated: {new Date(order.updatedAt).toLocaleString()}</p>
          {order.customerNote ? <p className="mt-3 text-sm text-slate-700">Customer Note: {order.customerNote}</p> : null}
        </article>

        <form onSubmit={onUpdateStatus} className="rounded-xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Update Status</h3>
          <label className="mt-3 block text-sm font-medium text-slate-700">
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

          <label className="mt-3 block text-sm font-medium text-slate-700">
            Sales Note
            <textarea
              rows={4}
              value={salesNote}
              onChange={(event) => setSalesNote(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Optional internal note"
            />
          </label>

          <button
            type="submit"
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60"
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? 'Updating...' : 'Save Status'}
          </button>
        </form>
      </div>
    </section>
  )
}
