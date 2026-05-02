import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getShopErrorDetails, shopService } from '@/features/shop/services/shopService'
import { useCart } from '@/features/shop/context/CartContext'
import { mockProducts } from '@/features/content/mockData'
import type { Product } from '@/shared/types/content'
import type { Review } from '@/shared/types/shop'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { getItemQty, addOrIncrement, setQuantity, pendingByProductId } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [isUsingMockProducts, setIsUsingMockProducts] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reviewTarget, setReviewTarget] = useState<Product | null>(null)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewList, setReviewList] = useState<Review[]>([])
  const isLeadLoggedIn = typeof window !== 'undefined' && !!sessionStorage.getItem('portfolio.lead.session')
  const canUseCart = isLeadLoggedIn

  const emptyDataFallbackEnabled = !import.meta.env.PROD && import.meta.env.VITE_ENABLE_EMPTY_DATA_MOCK !== 'false'

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      setIsUsingMockProducts(false)
      const response = await shopService.listProducts({
        page: 1,
        limit: 24,
        search: search || undefined,
        sortBy,
        sortOrder,
        isActive: true,
      })
      const shouldUseMockProducts = emptyDataFallbackEnabled && !search.trim() && response.records.length === 0

      setProducts(shouldUseMockProducts ? mockProducts : response.records)
      setIsUsingMockProducts(shouldUseMockProducts)
    } catch (err) {
      if (emptyDataFallbackEnabled && !search.trim()) {
        setProducts(mockProducts)
        setIsUsingMockProducts(true)
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load products')
      }
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [search, sortBy, sortOrder])

  const addToCart = async (productId: string, stock: number) => {
    try {
      await addOrIncrement(productId, stock)
      setStatus('Product added to cart.')
      setError(null)
    } catch (err) {
      const details = getShopErrorDetails(err, 'Sign in as lead to add cart items.')
      setError(details.message)
      setStatus(null)
    }
  }

  const updateQuantity = async (productId: string, nextQty: number, stock: number) => {
    try {
      await setQuantity(productId, nextQty, stock)
      setError(null)
      setStatus(nextQty <= 0 ? 'Product removed from cart.' : null)
    } catch (err) {
      const details = getShopErrorDetails(err, 'Failed to update cart quantity.')
      setError(details.message)
      setStatus(null)
    }
  }

  const handleDirectInput = async (productId: string, stock: number, rawValue: string) => {
    const trimmed = rawValue.trim()
    const parsed = trimmed === '' ? 0 : Number.parseInt(trimmed, 10)
    const safeQty = Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
    await updateQuantity(productId, safeQty, stock)
  }

  const openReview = async (product: Product) => {
    setReviewTarget(product)
    setReviewTitle('')
    setReviewComment('')
    setReviewRating(5)
    try {
      const reviews = await shopService.listReviewsByProduct(product._id, 1, 5)
      setReviewList(reviews.records)
    } catch {
      setReviewList([])
    }
  }

  const submitReview = async (event: FormEvent) => {
    event.preventDefault()
    if (!reviewTarget) return

    try {
      await shopService.createReview(reviewTarget._id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      })
      const reviews = await shopService.listReviewsByProduct(reviewTarget._id, 1, 5)
      setReviewList(reviews.records)
      setStatus('Review submitted successfully')
      setError(null)
      setReviewTitle('')
      setReviewComment('')
      setReviewRating(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Only purchased users can add review')
      setStatus(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="ui-page-card">
        <h2 className="ui-title">Products Marketplace</h2>
        <p className="ui-subtitle">
          Browse products, open details, add to cart, and share ratings once purchased.
        </p>

        {isUsingMockProducts ? (
          <p className="mt-3 inline-flex rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700 ring-1 ring-accent-200">
            Preview mode: showing mock products until the backend has live records.
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <input
            className="ui-input md:col-span-2"
            placeholder="Search by name, size, version"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="ui-input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="createdAt">Newest</option>
            <option value="name">Name</option>
            <option value="coopan_price">Offer price</option>
            <option value="stok">Stock</option>
          </select>
          <select
            className="ui-input"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        {status ? <p className="mt-4 rounded-lg bg-success-50 p-3 text-sm text-success-700">{status}</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-700">{error}</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {!productsLoading && products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-6 text-sm text-surface-700">
              No products available yet.
            </div>
          ) : null}
          {products.map((product) => (
            (() => {
              const currentQty = getItemQty(product._id)
              const isPending = !!pendingByProductId[product._id]

              return (
            <article
              key={product._id}
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              onClick={() => {
                if (!isUsingMockProducts) {
                  navigate(`/products/${product._id}`)
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  if (!isUsingMockProducts) {
                    navigate(`/products/${product._id}`)
                  }
                }
              }}
            >
              <div className="mb-4 overflow-hidden rounded-[1rem] border border-surface-200 bg-surface-100">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center text-sm text-surface-600">No product image</div>
                )}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-700">
                    {product.size}
                    {product.version ? ` · ${product.version}` : ''}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-surface-900">{product.name}</h3>
                </div>
                <span className="rounded-full bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-700">
                  Stock {product.stok}
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-surface-700">{product.description}</p>

              <div className="mt-4 flex items-center justify-between text-sm">
                <p className="font-semibold text-surface-900">Rs. {product.coopan_price}</p>
                <p className="text-surface-400 line-through">Rs. {product.marked_price}</p>
              </div>
              <p className="mt-1 text-xs text-surface-500">
                Rating {(product.avgRating || 0).toFixed(1)} ({product.ratingCount || 0} reviews)
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  to={`/products/${product._id}`}
                  className="ui-btn-secondary flex-1 text-center"
                  onClick={(event) => {
                    event.stopPropagation()
                    if (isUsingMockProducts) {
                      event.preventDefault()
                    }
                  }}
                  aria-disabled={isUsingMockProducts}
                  tabIndex={isUsingMockProducts ? -1 : 0}
                >
                  View details
                </Link>
                {currentQty > 0 ? (
                  canUseCart ? (
                  <div
                    className="flex flex-1 items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-2 py-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="h-8 w-8 rounded-md border border-surface-300 bg-white text-lg font-semibold text-surface-700"
                      onClick={() => void updateQuantity(product._id, currentQty - 1, product.stok)}
                      disabled={isUsingMockProducts || isPending}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={Math.min(99, Math.max(1, product.stok))}
                      value={currentQty}
                      className="h-8 w-14 rounded-md border border-surface-300 bg-white px-2 text-center text-sm font-semibold text-surface-900"
                      onChange={(event) => {
                        event.stopPropagation()
                        void handleDirectInput(product._id, product.stok, event.target.value)
                      }}
                      disabled={isUsingMockProducts || isPending}
                    />
                    <button
                      type="button"
                      className="h-8 w-8 rounded-md border border-surface-300 bg-white text-lg font-semibold text-surface-700"
                      onClick={() => void updateQuantity(product._id, currentQty + 1, product.stok)}
                      disabled={isUsingMockProducts || isPending || currentQty >= Math.min(99, Math.max(1, product.stok))}
                    >
                      +
                    </button>
                  </div>
                  ) : (
                    <Link
                      to="/lead/login"
                      className="ui-btn-primary flex-1 text-center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Sign in to add
                    </Link>
                  )
                ) : (
                  canUseCart ? (
                    <button
                      className="ui-btn-primary flex-1"
                      onClick={(event) => {
                        event.stopPropagation()
                        void addToCart(product._id, product.stok)
                      }}
                      disabled={isUsingMockProducts || product.stok <= 0 || isPending}
                    >
                      {isUsingMockProducts ? 'Preview only' : product.stok <= 0 ? 'Out of stock' : 'Add to cart'}
                    </button>
                  ) : (
                    <Link
                      to="/lead/login"
                      className="ui-btn-primary flex-1 text-center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Sign in to add
                    </Link>
                  )
                )}
                <button
                  className="ui-btn-secondary"
                  onClick={(event) => {
                    event.stopPropagation()
                    openReview(product)
                  }}
                  disabled={isUsingMockProducts}
                >
                  Reviews
                </button>
              </div>
            </article>
              )
            })()
          ))}
        </div>
      </div>

      {reviewTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/55 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900">Reviews for {reviewTarget.name}</h3>
              <button className="text-sm text-surface-500" onClick={() => setReviewTarget(null)}>
                Close
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={submitReview}>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  className="ui-input"
                  value={reviewRating}
                  onChange={(event) => setReviewRating(Number(event.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} Star
                    </option>
                  ))}
                </select>
                <input
                  className="ui-input"
                  placeholder="Review title"
                  value={reviewTitle}
                  onChange={(event) => setReviewTitle(event.target.value)}
                />
              </div>
              <textarea
                className="ui-textarea"
                rows={3}
                placeholder="Write your review"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                required
              />
              <button className="ui-btn-primary" type="submit">
                Submit review
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {reviewList.length === 0 ? (
                <p className="text-sm text-surface-600">No reviews yet.</p>
              ) : (
                reviewList.map((review) => (
                  <article key={review._id} className="rounded-lg border border-surface-200 p-3">
                    <p className="text-sm font-semibold text-surface-900">
                      {review.rating} / 5 {review.title ? `· ${review.title}` : ''}
                    </p>
                    <p className="mt-1 text-sm text-surface-600">{review.comment}</p>
                    <p className="mt-1 text-xs text-surface-500">By {review.leadId?.name || 'Customer'}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
