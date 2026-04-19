import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '@/shared/types/content'
import { sectionShell } from '@/pages/home/constants'

interface FeaturedProductsSectionProps {
  isLoading: boolean
  products: Product[]
  cartStatus: string | null
  cartError: string | null
  onAddToCart: (productId: string) => void
}

export function FeaturedProductsSection({
  isLoading,
  products,
  cartStatus,
  cartError,
  onAddToCart,
}: FeaturedProductsSectionProps) {
  const navigate = useNavigate()

  const loadingCards = Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 h-16 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  ))

  return (
    <section className={sectionShell}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Featured Products</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Products worth looking twice at</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          The best-performing items surface here with live pricing, stock, and version detail.
        </p>
      </div>

      {cartStatus ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{cartStatus}</span>
          <Link to="/cart" className="font-semibold text-emerald-800 underline-offset-2 hover:underline">
            Go to cart
          </Link>
        </div>
      ) : null}
      {cartError ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{cartError}</p> : null}

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{loadingCards}</div>
        ) : products.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/products/${product._id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigate(`/products/${product._id}`)
                    }
                  }}
                >
                  <div className="mb-4 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-100">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-sm text-slate-500">No product image</div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                        {product.size}
                        {product.version ? ` · ${product.version}` : ''}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-slate-950">{product.name}</h3>
                    </div>
                    <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      Stock {product.stok}
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{product.description}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Offer</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">Rs. {product.coopan_price}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Marked</p>
                      <p className="mt-1 text-lg font-semibold text-slate-400 line-through">Rs. {product.marked_price}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Base price Rs. {product.base_price}</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">Live product</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link to={`/products/${product._id}`} className="ui-btn-secondary text-center">
                    View details
                  </Link>
                  <button
                    type="button"
                    className="ui-btn-primary"
                    onClick={() => onAddToCart(product._id)}
                    disabled={product.stok <= 0}
                  >
                    {product.stok <= 0 ? 'Out of stock' : 'Add to cart'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
            Product highlights will appear here once the backend has active records.
          </div>
        )}
      </div>
    </section>
  )
}
