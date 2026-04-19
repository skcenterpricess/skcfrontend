import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { getShopErrorDetails, shopService } from '@/features/shop/services/shopService'
import { useCart } from '@/features/shop/context/CartContext'
import type { Product } from '@/shared/types/content'
import type { Review } from '@/shared/types/shop'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { getItemQty, addOrIncrement, setQuantity, pendingByProductId, isHydrated, isHydrating } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [checkingPurchase, setCheckingPurchase] = useState(false)
  const [hasPurchasedProduct, setHasPurchasedProduct] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [addedMessage, setAddedMessage] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const isLeadLoggedIn = typeof window !== 'undefined' && !!sessionStorage.getItem('portfolio.lead.session')
  const canUseCart = isAuthenticated || isLeadLoggedIn
  const canMutateCart = canUseCart && isHydrated
  const canSubmitReview = isLeadLoggedIn && hasPurchasedProduct

  useEffect(() => {
    if (!id) {
      setError('Product id is missing')
      setLoading(false)
      setReviewsLoading(false)
      return
    }

    const controller = new AbortController()

    const run = async () => {
      setLoading(true)
      setReviewsLoading(true)
      setReviewError(null)
      setAddedMessage(null)

      try {
        const [record, reviewResult] = await Promise.all([
          shopService.getProductById(id, controller.signal),
          shopService.listReviewsByProduct(id, 1, 10, controller.signal),
        ])

        setProduct(record)
        setReviews(reviewResult.records)
        setError(null)
      } catch (err) {
        const details = getShopErrorDetails(err, 'Failed to load product')
        if (details.reason === 'network' && controller.signal.aborted) {
          return
        }
        setError(details.message)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setReviewsLoading(false)
        }
      }
    }

    void run()
    return () => {
      controller.abort()
    }
  }, [id])

  useEffect(() => {
    if (!id || !isLeadLoggedIn) {
      setHasPurchasedProduct(false)
      setCheckingPurchase(false)
      return
    }

    let mounted = true

    const run = async () => {
      setCheckingPurchase(true)
      try {
        const purchased = await shopService.hasPurchasedProduct(id)
        if (mounted) {
          setHasPurchasedProduct(purchased)
        }
      } catch {
        if (mounted) {
          setHasPurchasedProduct(false)
        }
      } finally {
        if (mounted) {
          setCheckingPurchase(false)
        }
      }
    }

    void run()
    return () => {
      mounted = false
    }
  }, [id, isLeadLoggedIn])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [product?._id])

  const visibleRating = useMemo(() => (product?.avgRating ?? 0).toFixed(1), [product?.avgRating])
  const productImages = product?.images?.length ? product.images : []
  const activeProductImage = productImages[activeImageIndex] ?? productImages[0]

  const addToCart = async () => {
    if (!product || !canMutateCart) return
    if (product.stok <= 0) {
      setReviewError('This product is currently out of stock.')
      return
    }

    try {
      await addOrIncrement(product._id, product.stok)
      setAddedMessage('Product added to cart.')
      setReviewError(null)
    } catch (err) {
      const details = getShopErrorDetails(err, 'Please sign in as lead to add cart items')
      setReviewError(details.message)
    }
  }

  const updateQuantity = async (nextQty: number) => {
    if (!product || !canMutateCart) return
    try {
      await setQuantity(product._id, nextQty, product.stok)
      setReviewError(null)
      setAddedMessage(nextQty <= 0 ? 'Product removed from cart.' : null)
    } catch (err) {
      const details = getShopErrorDetails(err, 'Failed to update quantity')
      setReviewError(details.message)
      setAddedMessage(null)
    }
  }

  const handleDirectInput = async (rawValue: string) => {
    const trimmed = rawValue.trim()
    const parsed = trimmed === '' ? 0 : Number.parseInt(trimmed, 10)
    const safeQty = Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
    await updateQuantity(safeQty)
  }

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!product || submittingReview || !canSubmitReview) {
      if (!isLeadLoggedIn) {
        setReviewError('Sign in as lead to submit a review.')
      } else if (!hasPurchasedProduct) {
        setReviewError('Only customers who purchased this product can submit a review.')
      }
      return
    }

    const normalizedTitle = title.trim()
    const normalizedComment = comment.trim()
    if (!normalizedComment) {
      setReviewError('Review comment is required.')
      return
    }

    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }

    try {
      setSubmittingReview(true)
      await shopService.createReview(product._id, { rating, title: normalizedTitle, comment: normalizedComment })
      const reviewResult = await shopService.listReviewsByProduct(product._id, 1, 10)
      setReviews(reviewResult.records)
      setTitle('')
      setComment('')
      setRating(5)
      setReviewError(null)
      setAddedMessage('Review submitted successfully')
    } catch (err) {
      const details = getShopErrorDetails(err, 'Unable to submit review right now.')
      setReviewError(details.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <section className="ui-page-card">
        <div className="h-6 w-40 animate-pulse rounded-full bg-surface-200" />
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-surface-100 p-6">
            <div className="h-[26rem] animate-pulse rounded-3xl bg-surface-200" />
          </div>
          <div className="space-y-4 rounded-3xl border border-surface-200 bg-white p-6">
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-surface-200" />
            <div className="h-8 w-1/2 animate-pulse rounded-full bg-surface-200" />
            <div className="h-20 animate-pulse rounded-2xl bg-surface-100" />
          </div>
        </div>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="ui-page-card space-y-4 text-center">
        <h2 className="ui-title">Product not found</h2>
        <p className="ui-subtitle">{error ?? 'The product you requested is not available.'}</p>
        <div className="flex justify-center gap-3">
          <button className="ui-btn-secondary" onClick={() => navigate(-1)}>
            Go back
          </button>
          <Link className="ui-btn-primary" to="/projects">
            Browse products
          </Link>
        </div>
      </section>
    )
  }

  const stockLabel =
    product.stok > 25 ? 'In stock' : product.stok > 0 ? 'Limited stock' : 'Out of stock'
  const currentQty = getItemQty(product._id)
  const isCartPending = !!pendingByProductId[product._id]

  return (
    <section className="space-y-6 pb-4">
      <div className="rounded-[2rem] bg-brand-900 px-6 py-6 text-white shadow-[0_24px_90px_rgba(30,58,138,0.28)] sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accent-200">Product Detail</p>
            {/* <h2 className="mt-2 text-3xl font-black sm:text-4xl">Flipkart-level product view</h2> */}
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-accent-100 ring-1 ring-white/10">
            {product.size}
            {product.version ? ` · ${product.version}` : ''}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-surface-200 bg-white p-4 shadow-sm">
            <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-brand-50 via-white to-surface-100 p-6">
              <div className="absolute left-6 top-6 rounded-full bg-brand-900 px-3 py-1 text-xs font-semibold text-white">
                {stockLabel}
              </div>
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[1.5rem] border border-surface-200 bg-white shadow-sm">
                    {activeProductImage ? (
                      <img
                        src={activeProductImage.url}
                        alt={product.name}
                        className="h-[22rem] w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[22rem] items-center justify-center bg-surface-100 text-sm font-medium text-surface-500">
                        No product images available
                      </div>
                    )}

                    {productImages.length > 1 ? (
                      <div className="grid grid-cols-4 gap-2 border-t border-surface-200 bg-white p-3 sm:grid-cols-5">
                        {productImages.map((image, index) => (
                          <button
                            key={image.public_id}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            className={`overflow-hidden rounded-xl border-2 transition ${
                              index === activeImageIndex ? 'border-brand-500' : 'border-transparent hover:border-surface-300'
                            }`}
                          >
                            <img src={image.url} alt={`${product.name} thumbnail ${index + 1}`} className="h-20 w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <p className="text-xs uppercase tracking-[0.22em] text-brand-700">SKU preview</p>
                  <h1 className="text-3xl font-black leading-tight text-surface-900 sm:text-4xl">{product.name}</h1>
                  <p className="max-w-2xl text-base leading-7 text-surface-700">{product.description}</p>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-white px-4 py-2 font-semibold text-surface-700 shadow-sm ring-1 ring-surface-200">
                      Rating {visibleRating} / 5
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 font-semibold text-surface-700 shadow-sm ring-1 ring-surface-200">
                      {product.ratingCount || 0} reviews
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 font-semibold text-surface-700 shadow-sm ring-1 ring-surface-200">
                      {product.stok} units left
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.6rem] bg-brand-900 p-5 text-white shadow-2xl">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-accent-200">Best offer</p>
                      <p className="mt-2 text-4xl font-black">Rs. {product.coopan_price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.22em] text-surface-300">Marked</p>
                      <p className="mt-2 text-lg text-surface-300 line-through">Rs. {product.marked_price}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-slate-100 ring-1 ring-white/10">
                    Base price Rs. {product.base_price}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                      <p className="text-xs uppercase tracking-[0.2em] text-accent-200">Stock</p>
                      <p className="mt-1 text-lg font-semibold">{stockLabel}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                      <p className="text-xs uppercase tracking-[0.2em] text-accent-200">Status</p>
                      <p className="mt-1 text-lg font-semibold">{product.isActive ? 'Live' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black text-surface-900">Product highlights</h3>
                <p className="mt-1 text-sm text-surface-700">Sized for quick scan, styled for premium browsing.</p>
              </div>
              <button className="ui-btn-secondary" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-surface-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-surface-500">Price</p>
                <p className="mt-2 text-xl font-bold text-surface-900">Rs. {product.coopan_price}</p>
              </div>
              <div className="rounded-2xl bg-surface-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-surface-500">Offer gap</p>
                <p className="mt-2 text-xl font-bold text-surface-900">
                  Rs. {Math.max(0, product.marked_price - product.coopan_price)} off
                </p>
              </div>
              <div className="rounded-2xl bg-surface-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-surface-500">Review score</p>
                <p className="mt-2 text-xl font-bold text-surface-900">{visibleRating} / 5</p>
              </div>
              <div className="rounded-2xl bg-surface-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-surface-500">Reviews</p>
                <p className="mt-2 text-xl font-bold text-surface-900">{product.ratingCount || 0}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-surface-200 p-4">
                <p className="text-sm font-semibold text-surface-900">Shipping promise</p>
                <p className="mt-1 text-sm leading-6 text-surface-700">
                  No online payment is required. Once you place the order, the sales team will contact you shortly.
                </p>
              </div>
              <div className="rounded-2xl border border-surface-200 p-4">
                <p className="text-sm font-semibold text-surface-900">Purchase intent</p>
                <p className="mt-1 text-sm leading-6 text-surface-700">
                  Only verified purchasers can submit product reviews after buying this product.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black text-surface-900">Customer reviews</h3>
                <p className="mt-1 text-sm text-surface-700">Read recent feedback and submit your own after purchase.</p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                {reviews.length} visible
              </span>
            </div>

            {reviewError ? (
              <p className="mt-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-700">{reviewError}</p>
            ) : null}
            {addedMessage ? (
              <p className="mt-4 rounded-lg bg-success-50 p-3 text-sm text-success-700">{addedMessage}</p>
            ) : null}

            <form className="mt-5 grid gap-3 rounded-2xl border border-surface-200 bg-surface-50 p-4" onSubmit={submitReview}>
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <select
                  className="ui-input mt-0"
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  disabled={!canSubmitReview || checkingPurchase || submittingReview}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star
                    </option>
                  ))}
                </select>
                <input
                  className="ui-input mt-0"
                  placeholder="Review title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={!canSubmitReview || checkingPurchase || submittingReview}
                />
              </div>
              <textarea
                className="ui-textarea mt-0"
                rows={4}
                placeholder="Write a short, useful review"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                disabled={!canSubmitReview || checkingPurchase || submittingReview}
                required
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-surface-500">
                  {checkingPurchase
                    ? 'Checking purchase eligibility...'
                    : !isLeadLoggedIn
                      ? 'Sign in as lead to submit your review.'
                      : hasPurchasedProduct
                        ? 'Review is accepted only for verified purchasers.'
                        : 'Review is disabled until you purchase this product.'}
                </p>
                <button
                  className="ui-btn-primary"
                  type="submit"
                  disabled={submittingReview || checkingPurchase || !canSubmitReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit review'}
                </button>
              </div>
            </form>

            <div className="mt-6 space-y-4">
              {reviewsLoading ? (
                <div className="rounded-2xl border border-surface-200 p-4 text-sm text-surface-500">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <article key={review._id} className="rounded-2xl border border-surface-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-surface-900">
                        {review.title || 'Verified review'}
                      </p>
                      <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
                        {review.rating} / 5
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-surface-700">{review.comment}</p>
                    <p className="mt-3 text-xs text-surface-500">By {review.leadId?.name || 'Customer'}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-surface-300 p-5 text-sm text-surface-700">
                  No visible reviews yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-700">Purchase box</p>
            <h3 className="mt-2 text-2xl font-black text-surface-900">Buy now, pay later</h3>
            <p className="mt-2 text-sm leading-6 text-surface-700">
              The order goes directly to the sales team and you’ll be contacted shortly.
            </p>

            {canUseCart ? (
              <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4">
                <label className="text-sm font-medium text-slate-700">Quantity</label>
                {isHydrating ? (
                  <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800 ring-1 ring-brand-100">
                    Syncing your cart session. Actions will unlock in a moment.
                  </p>
                ) : null}
                <div className="flex items-center gap-3">
                  <button
                    className="ui-btn-secondary h-10 w-10 px-0"
                    onClick={() => void updateQuantity(currentQty > 0 ? currentQty - 1 : 0)}
                    type="button"
                    disabled={!canMutateCart || isCartPending || currentQty <= 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={Math.min(99, Math.max(1, product.stok))}
                    value={currentQty}
                    className="h-10 min-w-16 rounded-lg border border-slate-300 bg-white px-3 text-center text-sm font-semibold text-slate-900"
                    onChange={(event) => void handleDirectInput(event.target.value)}
                    disabled={!canMutateCart || isCartPending || product.stok <= 0}
                  />
                  <button
                    className="ui-btn-secondary h-10 w-10 px-0"
                    onClick={() => void updateQuantity(currentQty > 0 ? currentQty + 1 : 1)}
                    type="button"
                    disabled={!canMutateCart || isCartPending || product.stok <= 0 || currentQty >= Math.min(99, Math.max(1, product.stok))}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-accent-50 p-4 text-sm text-accent-800 ring-1 ring-accent-100">
                Sign in to add this product to your cart and continue checkout.
              </div>
            )}

            <div className="mt-5 space-y-3">
              {canUseCart ? (
                <>
                  {currentQty > 0 ? null : (
                    <button
                      className="ui-btn-primary w-full"
                      onClick={addToCart}
                      disabled={!canMutateCart || product.stok <= 0 || isCartPending}
                    >
                      {!canMutateCart ? 'Syncing cart...' : product.stok <= 0 ? 'Out of stock' : isCartPending ? 'Adding...' : 'Add to cart'}
                    </button>
                  )}
                  <Link to="/cart" className="ui-btn-secondary block text-center">
                    Go to cart
                  </Link>
                </>
              ) : (
                <Link to="/lead/login" className="ui-btn-primary block text-center">
                  Sign in to continue
                </Link>
              )}
              <Link to="/projects" className="ui-btn-secondary block text-center">
                Back to catalog
              </Link>
            </div>

            <div className="mt-5 space-y-2 text-sm text-surface-700">
              <p>Direct sales follow-up</p>
              <p>Verified reviews only</p>
              <p>Stock-aware add to cart</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-700">Why it stands out</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-surface-700">
              <li className="rounded-2xl bg-surface-50 p-3">Premium gradient hero with clear hierarchy.</li>
              <li className="rounded-2xl bg-surface-50 p-3">Sticky purchase box for fast conversion.</li>
              <li className="rounded-2xl bg-surface-50 p-3">Review-first trust signals and visible stock cues.</li>
              <li className="rounded-2xl bg-surface-50 p-3">No online payment friction, sales-led order completion.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  )
}
