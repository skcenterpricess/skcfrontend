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

const normalizeShippingAddress = (value: ShippingAddress): ShippingAddress => ({
  fullName: value.fullName.trim(),
  phone: value.phone.trim(),
  line1: value.line1.trim(),
  line2: value.line2?.trim() || '',
  city: value.city.trim(),
  state: value.state.trim(),
  pincode: value.pincode.trim(),
  country: value.country?.trim() || 'India',
})

const validateCheckoutInput = (cart: Cart | null, shipping: ShippingAddress): string | null => {
  if (!cart || cart.items.length === 0) {
    return 'Your cart is empty. Add items before placing an order.'
  }

  const hasInvalidItem = cart.items.some((item) => item.quantity < 1 || item.quantity > Math.max(0, item.productId.stok))
  if (hasInvalidItem) {
    return 'Cart quantities are out of sync with stock. Please update your cart and try again.'
  }

  if (!shipping.fullName || !shipping.phone || !shipping.line1 || !shipping.city || !shipping.state || !shipping.pincode) {
    return 'Please complete all required shipping fields before placing the order.'
  }

  if (!/^\d{10}$/.test(shipping.phone.replace(/\D/g, ''))) {
    return 'Please enter a valid 10-digit phone number.'
  }

  if (!/^\d{6}$/.test(shipping.pincode)) {
    return 'Please enter a valid 6-digit pincode.'
  }

  return null
}

export default function CartPage() {
  const [profile, setProfile] = useState<LeadAuthUser | null>(null)
  const [cart, setCart] = useState<Cart | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [shipping, setShipping] = useState<ShippingAddress>(emptyShipping)
  const [customerNote, setCustomerNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCartMutating, setIsCartMutating] = useState(false)
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
    if (isCartMutating || isSubmitting) return

    const item = cart?.items.find((record) => record.productId._id === productId)
    if (!item) return

    const nextQty = Math.min(Math.max(0, quantity), Math.max(0, item.productId.stok))

    try {
      setIsCartMutating(true)
      const nextCart =
        nextQty <= 0 ? await shopService.removeCartItem(productId) : await shopService.updateCartItem(productId, nextQty)
      setCart(nextCart)
      setError('')
      setSuccess('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart')
    } finally {
      setIsCartMutating(false)
    }
  }

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || isCartMutating) return

    const normalizedShipping = normalizeShippingAddress(shipping)
    const validationError = validateCheckoutInput(cart, normalizedShipping)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await shopService.placeOrder(normalizedShipping, customerNote.trim())
      const [nextCart, nextOrders] = await Promise.all([shopService.getMyCart(), shopService.listMyOrders(1, 5)])
      setCart(nextCart)
      setOrders(nextOrders.records)
      setShipping((prev) => ({ ...prev, ...normalizedShipping }))
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
        <div className="h-8 w-40 animate-pulse rounded-full bg-surface-200" />
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-[24rem] animate-pulse rounded-3xl bg-surface-100" />
          <div className="h-[24rem] animate-pulse rounded-3xl bg-surface-100" />
        </div>
      </section>
    )
  }

  if (isUnauthorized) {
    return (
      <section className="ui-page-card-narrow">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-700">Cart</p>
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
      <div className="rounded-[2rem] bg-brand-900 px-6 py-6 text-white shadow-[0_24px_90px_rgba(30,58,138,0.28)] sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accent-200">Cart & Checkout</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Manage items before offline order</h2>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-accent-100 ring-1 ring-white/10">
            Logged in as {profile?.name || 'Lead'}
          </div>
        </div>
      </div>

      {success ? <p className="rounded-2xl bg-success-50 px-4 py-3 text-sm text-success-700">{success}</p> : null}
      {error ? <p className="rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-surface-900">Your Cart</h3>
              <p className="mt-1 text-sm text-surface-700">Quantity changes are saved directly against the backend cart.</p>
            </div>
            <Link className="ui-btn-secondary" to="/projects">
              Continue shopping
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {cart && cart.items.length > 0 ? (
              cart.items.map((item) => (
                <article key={item.productId._id} className="rounded-2xl border border-surface-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Link
                        to={`/products/${item.productId._id}`}
                        className="text-lg font-bold text-surface-900 transition hover:text-brand-700"
                      >
                        {item.productId.name}
                      </Link>
                      <p className="text-sm text-surface-700">
                        Rs. {item.unitPrice} each · Line total Rs. {item.lineTotal}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-3 py-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-300 text-lg font-semibold text-surface-700 transition hover:bg-brand-700 hover:text-white"
                        onClick={() => updateCartQty(item.productId._id, item.quantity - 1)}
                        aria-label={`Decrease quantity for ${item.productId.name}`}
                        disabled={isCartMutating || isSubmitting}
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-surface-900">{item.quantity}</span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-300 text-lg font-semibold text-surface-700 transition hover:bg-brand-700 hover:text-white"
                        onClick={() => updateCartQty(item.productId._id, item.quantity + 1)}
                        aria-label={`Increase quantity for ${item.productId.name}`}
                        disabled={isCartMutating || isSubmitting || item.quantity >= item.productId.stok}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <p className="text-surface-500">Stock {item.productId.stok}</p>
                    <button
                      type="button"
                      className="font-semibold text-danger-600 transition hover:text-danger-700"
                      onClick={() => updateCartQty(item.productId._id, 0)}
                      disabled={isCartMutating || isSubmitting}
                    >
                      Remove item
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-6 text-sm text-surface-700">
                Your cart is empty. Browse products and add items to continue.
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-surface-500">Total items</p>
              <p className="mt-2 text-2xl font-black text-surface-900">{cart?.totalItems || 0}</p>
            </div>
            <div className="rounded-2xl bg-brand-900 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-accent-200">Subtotal</p>
              <p className="mt-2 text-2xl font-black">Rs. {cart?.subtotal || 0}</p>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <form className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm" onSubmit={placeOrder}>
            <div>
              <h3 className="text-2xl font-black text-surface-900">Checkout</h3>
              <p className="mt-1 text-sm text-surface-700">
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

            <button
              className="ui-btn-primary mt-5 w-full"
              type="submit"
              disabled={orderButtonDisabled || isSubmitting || isCartMutating}
            >
              {isSubmitting ? 'Placing order...' : isCartMutating ? 'Updating cart...' : 'Place order'}
            </button>
          </form>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-2xl font-black text-surface-900">Recent Orders</h3>
              <p className="mt-1 text-sm text-surface-700">Offline orders are tracked here while sales follows up.</p>
            </div>

            <div className="mt-5 space-y-3">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-5 text-sm text-surface-700">
                  No orders yet.
                </div>
              ) : (
                orders.map((order) => (
                  <article key={order._id} className="rounded-2xl border border-surface-200 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-surface-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-2 text-surface-700">
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