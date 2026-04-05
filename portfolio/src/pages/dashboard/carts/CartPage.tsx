import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { leadAuthService, type LeadAuthUser } from '@/features/leads/services/leadAuthService'
import { shopService } from '@/features/shop/services/shopService'
import type { Cart, Order, ShippingAddress } from '@/shared/types/shop'

const emptyShipping: ShippingAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
}

export default function CartPage() {
  const [profile, setProfile] = useState<LeadAuthUser | null>(null)
  const [cart, setCart] = useState<Cart | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [shipping, setShipping] = useState<ShippingAddress>(emptyShipping)
  const [customerNote, setCustomerNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hydrate = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const lead = await leadAuthService.me()
      setProfile(lead)
      setShipping({
        fullName: lead.name,
        phone: lead.phone,
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      })
      const [myCart, myOrders] = await Promise.all([shopService.getMyCart(), shopService.listMyOrders(1, 5)])
      setCart(myCart)
      setOrders(myOrders.records)
      setIsUnauthorized(false)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setIsUnauthorized(true)
      } else {
        setError('Unable to load your cart right now.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void hydrate()
  }, [])

  const orderButtonDisabled = useMemo(() => {
    if (!cart || cart.items.length === 0) return true
    return !shipping.fullName || !shipping.phone || !shipping.line1 || !shipping.city || !shipping.state || !shipping.pincode
  }, [cart, shipping])

  const updateCartQty = async (productId: string, quantity: number) => {
    try {
      const nextCart = quantity <= 0 ? await shopService.removeCartItem(productId) : await shopService.updateCartItem(productId, quantity)
      setCart(nextCart)
      setError('')
      setSuccess('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart')
    }
  }

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await shopService.placeOrder(shipping, customerNote)
      const [nextCart, nextOrders] = await Promise.all([shopService.getMyCart(), shopService.listMyOrders(1, 5)])
      setCart(nextCart)
      setOrders(nextOrders.records)
      setCustomerNote('')
      setSuccess('Order placed. Sales team will contact you shortly.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="ui-page-card space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-[24rem] animate-pulse rounded-3xl bg-slate-100" />
          <div className="h-[24rem] animate-pulse rounded-3xl bg-slate-100" />
        </div>
      </section>
    )
  }

  if (isUnauthorized) {
    return (
      <section className="ui-page-card-narrow">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-700">Cart</p>
        <h2 className="ui-title mt-2">Sign in to manage your cart</h2>
        <p className="ui-subtitle">Cart, checkout, and offline order placement are available after lead login.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="ui-btn-primary" to="/lead/login">
            Go to Lead Login
          </Link>
          <Link className="ui-btn-secondary" to="/projects">
            Continue browsing
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 pb-4">
      <div className="rounded-[2rem] bg-slate-950 px-6 py-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.22)] sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Cart & Checkout</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Manage items before offline order</h2>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-100 ring-1 ring-white/10">
            Logged in as {profile?.name || 'Lead'}
          </div>
        </div>
      </div>

      {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-slate-950">Your Cart</h3>
              <p className="mt-1 text-sm text-slate-600">Quantity changes are saved directly against the backend cart.</p>
            </div>
            <Link className="ui-btn-secondary" to="/projects">
              Continue shopping
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {cart && cart.items.length > 0 ? (
              cart.items.map((item) => (
                <article key={item.productId._id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Link
                        to={`/products/${item.productId._id}`}
                        className="text-lg font-bold text-slate-950 transition hover:text-cyan-700"
                      >
                        {item.productId.name}
                      </Link>
                      <p className="text-sm text-slate-600">
                        Rs. {item.unitPrice} each · Line total Rs. {item.lineTotal}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white"
                        onClick={() => updateCartQty(item.productId._id, item.quantity - 1)}
                        aria-label={`Decrease quantity for ${item.productId.name}`}
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white"
                        onClick={() => updateCartQty(item.productId._id, item.quantity + 1)}
                        aria-label={`Increase quantity for ${item.productId.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <p className="text-slate-500">Stock {item.productId.stok}</p>
                    <button
                      type="button"
                      className="font-semibold text-rose-600 transition hover:text-rose-700"
                      onClick={() => updateCartQty(item.productId._id, 0)}
                    >
                      Remove item
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Your cart is empty. Browse products and add items to continue.
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total items</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{cart?.totalItems || 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Subtotal</p>
              <p className="mt-2 text-2xl font-black">Rs. {cart?.subtotal || 0}</p>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <form className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm" onSubmit={placeOrder}>
            <div>
              <h3 className="text-2xl font-black text-slate-950">Checkout</h3>
              <p className="mt-1 text-sm text-slate-600">
                No online payment. After you place the order, the sales team will contact you.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <input
                className="ui-input"
                placeholder="Full name"
                value={shipping.fullName}
                onChange={(event) => setShipping((prev) => ({ ...prev, fullName: event.target.value }))}
                required
              />
              <input
                className="ui-input"
                placeholder="Phone"
                value={shipping.phone}
                onChange={(event) => setShipping((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
              <input
                className="ui-input"
                placeholder="Address line 1"
                value={shipping.line1}
                onChange={(event) => setShipping((prev) => ({ ...prev, line1: event.target.value }))}
                required
              />
              <input
                className="ui-input"
                placeholder="Address line 2 (optional)"
                value={shipping.line2 || ''}
                onChange={(event) => setShipping((prev) => ({ ...prev, line2: event.target.value }))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="ui-input"
                  placeholder="City"
                  value={shipping.city}
                  onChange={(event) => setShipping((prev) => ({ ...prev, city: event.target.value }))}
                  required
                />
                <input
                  className="ui-input"
                  placeholder="State"
                  value={shipping.state}
                  onChange={(event) => setShipping((prev) => ({ ...prev, state: event.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="ui-input"
                  placeholder="Pincode"
                  value={shipping.pincode}
                  onChange={(event) => setShipping((prev) => ({ ...prev, pincode: event.target.value }))}
                  required
                />
                <input
                  className="ui-input"
                  placeholder="Country"
                  value={shipping.country || 'India'}
                  onChange={(event) => setShipping((prev) => ({ ...prev, country: event.target.value }))}
                  required
                />
              </div>
              <textarea
                className="ui-textarea"
                rows={3}
                placeholder="Customer note (optional)"
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
              />
            </div>

            <button className="ui-btn-primary mt-5 w-full" type="submit" disabled={orderButtonDisabled || isSubmitting}>
              {isSubmitting ? 'Placing order...' : 'Place order'}
            </button>
          </form>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-2xl font-black text-slate-950">Recent Orders</h3>
              <p className="mt-1 text-sm text-slate-600">Offline orders are tracked here while sales follows up.</p>
            </div>

            <div className="mt-5 space-y-3">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  No orders yet.
                </div>
              ) : (
                orders.map((order) => (
                  <article key={order._id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-950">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-600">
                      {order.totalItems} items · Rs. {order.subtotal}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}