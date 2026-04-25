import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { getStoredLeadSession, setStoredLeadSession, type LeadAuthUser } from '@/features/leads/services/leadAuthService'
import { getShopErrorDetails, shopService } from '@/features/shop/services/shopService'
import type { Address, Cart, Order, Review, ShippingAddress } from '@/shared/types/shop'

const emptyAddress: ShippingAddress = {
  fullName: '',
  phone: '',
  area: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))

const formatStatus = (value: string) => value.replaceAll('_', ' ')

const normalizeAddress = (value: ShippingAddress): ShippingAddress => ({
  fullName: value.fullName.trim(),
  phone: value.phone.trim(),
  area: value.area?.trim() || '',
  line1: value.line1.trim(),
  line2: value.line2?.trim() || '',
  city: value.city.trim(),
  state: value.state.trim(),
  pincode: value.pincode.trim(),
  country: value.country?.trim() || 'India',
})

const getAddressText = (address: Address) =>
  [address.line1, address.area, address.city, address.state, address.pincode].filter(Boolean).join(', ')

const getReviewProduct = (review: Review) => {
  if (typeof review.productId === 'string') {
    return { id: review.productId, name: 'Product' }
  }

  return { id: review.productId._id, name: review.productId.name }
}

interface ReviewDraft {
  rating: number
  title: string
  comment: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const storedLead = typeof window !== 'undefined' ? getStoredLeadSession() : null
  const [lead, setLead] = useState<LeadAuthUser | null>(storedLead)
  const [cart, setCart] = useState<Cart | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>({})
  const [addressForm, setAddressForm] = useState<ShippingAddress>(emptyAddress)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!!storedLead)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const activeUser = lead ?? user
  const firstName = activeUser?.name?.split(' ')[0] ?? 'User'

  const purchasedProducts = useMemo(() => {
    const reviewedIds = new Set(reviews.map((review) => getReviewProduct(review).id))
    const products = new Map<string, string>()

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.productId?._id) {
          products.set(item.productId._id, item.productId.name || item.name)
        }
      })
    })

    return Array.from(products, ([id, name]) => ({ id, name, reviewed: reviewedIds.has(id) }))
  }, [orders, reviews])

  const loadLeadDashboard = async () => {
    if (!storedLead) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const dashboard = await shopService.getMyDashboard()

      setStoredLeadSession(dashboard.user)
      setLead(dashboard.user)
      setCart(dashboard.cart)
      setOrders(dashboard.orders)
      setAddresses(dashboard.addresses)
      setReviews(dashboard.reviews)
      setReviewDrafts(
        dashboard.reviews.reduce<Record<string, ReviewDraft>>((drafts, review) => {
          drafts[review._id] = { rating: review.rating, title: review.title || '', comment: review.comment }
          return drafts
        }, {}),
      )
      setAddressForm((prev) => ({
        ...prev,
        fullName: prev.fullName || dashboard.user.name,
        phone: prev.phone || dashboard.user.phone,
      }))
    } catch (err) {
      setError(getShopErrorDetails(err, 'Unable to load dashboard details.').message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadLeadDashboard()
  }, [])

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setAddressForm({
      ...emptyAddress,
      fullName: lead?.name || '',
      phone: lead?.phone || '',
    })
  }

  const editAddress = (address: Address) => {
    setEditingAddressId(address._id)
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      area: address.area || '',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || 'India',
    })
  }

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = normalizeAddress(addressForm)

    if (!payload.fullName || !payload.phone || !payload.line1 || !payload.city || !payload.state || !payload.pincode) {
      setError('Please complete all required address fields.')
      return
    }

    setIsSavingAddress(true)
    setError('')
    setSuccess('')

    try {
      const saved = editingAddressId
        ? await shopService.updateAddress(editingAddressId, payload)
        : await shopService.createAddress(payload)

      setAddresses((prev) => [saved, ...prev.filter((address) => address._id !== saved._id)])
      setSuccess(editingAddressId ? 'Address updated.' : 'Address added.')
      resetAddressForm()
    } catch (err) {
      setError(getShopErrorDetails(err, 'Unable to save address.').message)
    } finally {
      setIsSavingAddress(false)
    }
  }

  const deleteAddress = async (addressId: string) => {
    setBusyId(addressId)
    setError('')
    setSuccess('')

    try {
      await shopService.deleteAddress(addressId)
      setAddresses((prev) => prev.filter((address) => address._id !== addressId))
      setSuccess('Address deleted.')
      if (editingAddressId === addressId) resetAddressForm()
    } catch (err) {
      setError(getShopErrorDetails(err, 'Unable to delete address.').message)
    } finally {
      setBusyId(null)
    }
  }

  const updateReviewDraft = (reviewId: string, patch: Partial<ReviewDraft>) => {
    setReviewDrafts((prev) => ({ ...prev, [reviewId]: { ...prev[reviewId], ...patch } }))
  }

  const saveReview = async (reviewId: string) => {
    const draft = reviewDrafts[reviewId]
    if (!draft?.comment.trim()) {
      setError('Review comment is required.')
      return
    }

    setBusyId(reviewId)
    setError('')
    setSuccess('')

    try {
      const updated = await shopService.updateReview(reviewId, {
        rating: draft.rating,
        title: draft.title.trim(),
        comment: draft.comment.trim(),
      })
      setReviews((prev) => prev.map((review) => (review._id === reviewId ? { ...review, ...updated } : review)))
      setSuccess('Review updated.')
    } catch (err) {
      setError(getShopErrorDetails(err, 'Unable to update review.').message)
    } finally {
      setBusyId(null)
    }
  }

  const deleteReview = async (reviewId: string) => {
    setBusyId(reviewId)
    setError('')
    setSuccess('')

    try {
      await shopService.deleteReview(reviewId)
      setReviews((prev) => prev.filter((review) => review._id !== reviewId))
      setReviewDrafts((prev) => {
        const next = { ...prev }
        delete next[reviewId]
        return next
      })
      setSuccess('Review deleted.')
    } catch (err) {
      setError(getShopErrorDetails(err, 'Unable to delete review.').message)
    } finally {
      setBusyId(null)
    }
  }

  if (!lead) {
    return (
      <section className="space-y-6 pb-4">
        <div className="rounded-[2rem] bg-brand-900 px-6 py-7 text-white shadow-[0_24px_80px_rgba(124,45,18,0.28)] sm:px-8">
          <p className="text-xs uppercase tracking-[0.24em] text-accent-200">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Welcome, {firstName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
            Lead shopping tools are available after lead login.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Products', href: '/projects', description: 'Browse catalog items' },
            { label: 'Cart', href: '/cart', description: 'Open checkout' },
            { label: 'Lead Profile', href: '/lead/profile', description: 'Manage lead details' },
            { label: 'Contact', href: '/contact', description: 'Reach the SKC team' },
          ].map((link) => (
            <Link key={link.href} to={link.href} className="rounded-[1.4rem] border border-surface-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <h2 className="text-lg font-bold text-surface-900">{link.label}</h2>
              <p className="mt-2 text-sm leading-6 text-surface-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="space-y-5 pb-4" aria-busy="true">
        <div className="h-36 animate-pulse rounded-[2rem] bg-surface-100" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-[1.4rem] bg-surface-100" />)}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 pb-4">
      <div className="rounded-[2rem] bg-brand-900 px-6 py-7 text-white shadow-[0_24px_80px_rgba(124,45,18,0.28)] sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accent-200">Lead Dashboard</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Welcome, {firstName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
              Manage your cart, offline orders, product reviews, and delivery addresses from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/projects" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Browse Products</Link>
            <Link to="/cart" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">Checkout</Link>
          </div>
        </div>
      </div>

      {success ? <p className="rounded-2xl bg-success-50 px-4 py-3 text-sm text-success-700">{success}</p> : null}
      {error ? <p className="rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Cart Items', value: cart?.totalItems ?? 0 },
          { label: 'Cart Subtotal', value: `Rs. ${cart?.subtotal ?? 0}` },
          { label: 'Orders', value: orders.length },
          { label: 'Addresses', value: addresses.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.4rem] border border-surface-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-black text-surface-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-surface-900">Cart</h2>
              <p className="mt-1 text-sm text-surface-700">Current items waiting for checkout.</p>
            </div>
            <Link to="/cart" className="ui-btn-secondary">Open Cart</Link>
          </div>
          <div className="mt-5 space-y-3">
            {cart?.items.length ? cart.items.slice(0, 4).map((item) => (
              <article key={item.productId._id} className="rounded-2xl border border-surface-200 p-4">
                <Link to={`/products/${item.productId._id}`} className="font-bold text-surface-900 transition hover:text-brand-700">{item.productId.name}</Link>
                <p className="mt-1 text-sm text-surface-600">Qty {item.quantity} / Rs. {item.lineTotal}</p>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-5 text-sm text-surface-700">Your cart is empty.</div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-surface-900">Orders</h2>
          <p className="mt-1 text-sm text-surface-700">Recent offline orders and sales follow-up status.</p>
          <div className="mt-5 space-y-3">
            {orders.length ? orders.map((order) => (
              <article key={order._id} className="rounded-2xl border border-surface-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-surface-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="mt-1 text-sm text-surface-600">{order.totalItems} items / Rs. {order.subtotal} / {formatDate(order.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold capitalize text-accent-800">{formatStatus(order.status)}</span>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-5 text-sm text-surface-700">No orders yet.</div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-surface-900">Reviews</h2>
            <p className="mt-1 text-sm text-surface-700">Edit submitted reviews, or review products you bought.</p>
          </div>
          <Link to="/projects" className="ui-btn-secondary">Find Products</Link>
        </div>

        {purchasedProducts.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {purchasedProducts.slice(0, 6).map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="rounded-2xl border border-surface-200 bg-surface-50 p-4 transition hover:border-brand-300 hover:bg-white">
                <p className="font-bold text-surface-900">{product.name}</p>
                <p className="mt-1 text-sm text-surface-600">{product.reviewed ? 'Review submitted' : 'Add a review'}</p>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {reviews.length ? reviews.map((review) => {
            const product = getReviewProduct(review)
            const draft = reviewDrafts[review._id] ?? { rating: review.rating, title: review.title || '', comment: review.comment }

            return (
              <article key={review._id} className="rounded-2xl border border-surface-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link to={`/products/${product.id}`} className="font-bold text-surface-900 transition hover:text-brand-700">{product.name}</Link>
                  <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">{review.isVisible ? 'Visible' : 'Hidden'}</span>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[8rem_1fr]">
                  <select className="ui-input" value={draft.rating} onChange={(event) => updateReviewDraft(review._id, { rating: Number(event.target.value) })}>
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                  </select>
                  <input className="ui-input" value={draft.title} onChange={(event) => updateReviewDraft(review._id, { title: event.target.value })} placeholder="Review title" />
                </div>
                <textarea className="ui-textarea mt-3" rows={3} value={draft.comment} onChange={(event) => updateReviewDraft(review._id, { comment: event.target.value })} placeholder="Review comment" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="ui-btn-primary" onClick={() => saveReview(review._id)} disabled={busyId === review._id}>{busyId === review._id ? 'Saving...' : 'Save Review'}</button>
                  <button type="button" className="ui-btn-secondary text-danger-700" onClick={() => deleteReview(review._id)} disabled={busyId === review._id}>Delete</button>
                </div>
              </article>
            )
          }) : (
            <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-5 text-sm text-surface-700">No reviews yet.</div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <form className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm" onSubmit={saveAddress}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-surface-900">{editingAddressId ? 'Edit Address' : 'Add Address'}</h2>
              <p className="mt-1 text-sm text-surface-700">Saved addresses can be selected during checkout.</p>
            </div>
            {editingAddressId ? <button type="button" className="ui-btn-secondary" onClick={resetAddressForm}>Cancel</button> : null}
          </div>
          <div className="mt-5 grid gap-3">
            <input className="ui-input" placeholder="Full name" value={addressForm.fullName} onChange={(event) => setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
            <input className="ui-input" placeholder="Phone" value={addressForm.phone} onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))} required />
            <input className="ui-input" placeholder="Area (optional)" value={addressForm.area || ''} onChange={(event) => setAddressForm((prev) => ({ ...prev, area: event.target.value }))} />
            <input className="ui-input" placeholder="Address line 1" value={addressForm.line1} onChange={(event) => setAddressForm((prev) => ({ ...prev, line1: event.target.value }))} required />
            <input className="ui-input" placeholder="Address line 2 (optional)" value={addressForm.line2 || ''} onChange={(event) => setAddressForm((prev) => ({ ...prev, line2: event.target.value }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="ui-input" placeholder="City" value={addressForm.city} onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))} required />
              <input className="ui-input" placeholder="State" value={addressForm.state} onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="ui-input" placeholder="Pincode" value={addressForm.pincode} onChange={(event) => setAddressForm((prev) => ({ ...prev, pincode: event.target.value }))} required />
              <input className="ui-input" placeholder="Country" value={addressForm.country || 'India'} onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))} required />
            </div>
          </div>
          <button type="submit" className="ui-btn-primary mt-5 w-full" disabled={isSavingAddress}>{isSavingAddress ? 'Saving...' : editingAddressId ? 'Update Address' : 'Add Address'}</button>
        </form>

        <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-surface-900">Address Management</h2>
          <p className="mt-1 text-sm text-surface-700">Keep delivery details ready for future orders.</p>
          <div className="mt-5 space-y-3">
            {addresses.length ? addresses.map((address) => (
              <article key={address._id} className="rounded-2xl border border-surface-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-surface-900">{address.fullName}</p>
                    <p className="mt-1 text-sm text-surface-600">{address.phone}</p>
                    <p className="mt-1 text-sm leading-6 text-surface-700">{getAddressText(address)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="ui-btn-secondary" onClick={() => editAddress(address)}>Edit</button>
                    <button type="button" className="ui-btn-secondary text-danger-700" onClick={() => deleteAddress(address._id)} disabled={busyId === address._id}>{busyId === address._id ? 'Deleting...' : 'Delete'}</button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-5 text-sm text-surface-700">No saved addresses yet.</div>
            )}
          </div>
        </section>
      </section>
    </section>
  )
}
