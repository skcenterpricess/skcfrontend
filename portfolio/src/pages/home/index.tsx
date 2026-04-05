import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContent } from '@/features/content/context/ContentContext'
import { shopService } from '@/features/shop/services/shopService'

export default function HomePage() {
  const navigate = useNavigate()
  const { headerSlides, topProducts, topTestimonials, topAchievements, isLoading, usesMockFallback } = useContent()
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [cartStatus, setCartStatus] = useState<string | null>(null)
  const [cartError, setCartError] = useState<string | null>(null)

  useEffect(() => {
    if (headerSlides.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % headerSlides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [headerSlides])

  const safeActiveSlideIndex = headerSlides.length ? activeSlideIndex % headerSlides.length : 0
  const currentSlide = headerSlides[safeActiveSlideIndex] ?? headerSlides[0]

  const featuredProducts = useMemo(() => topProducts.slice(0, 5), [topProducts])
  const featuredTestimonials = useMemo(() => topTestimonials.slice(0, 3), [topTestimonials])
  const featuredAchievements = useMemo(() => topAchievements.slice(0, 6), [topAchievements])

  const heroFallback = {
    heading: 'Design-led portfolio experiences for modern brands',
    description:
      'A compact, editorial landing page built to showcase your strongest products, wins, and client proof with a premium visual rhythm.',
  }

  const sectionShell =
    'rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur'

  const loadingCards = (count: number, className: string) =>
    Array.from({ length: count }).map((_, index) => (
      <div key={index} className={className}>
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    ))

  const addToCart = async (productId: string) => {
    try {
      await shopService.addToCart(productId, 1)
      setCartStatus('Product added to cart. Open cart to place your order.')
      setCartError(null)
    } catch (err) {
      setCartStatus(null)
      setCartError(err instanceof Error ? err.message : 'Please sign in as lead to add product in cart.')
    }
  }

  return (
    <section className="space-y-8 pb-4">
      <div className="relative overflow-hidden rounded-[2.25rem] bg-slate-950 px-6 py-8 text-white shadow-[0_24px_90px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.22),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.94),_rgba(15,23,42,0.86))]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200 backdrop-blur">
              HAR DARWAZE KI MAJBOOTI, HAMARI PEHCHAN
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-200/90">
                SKC HARWARE
              </p>
              <h1 className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {currentSlide?.heading ?? heroFallback.heading}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                {currentSlide?.description ?? heroFallback.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-4 py-2 text-cyan-100 ring-1 ring-white/10">
                Live content enabled
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-cyan-100 ring-1 ring-white/10">
                Products, achievements, testimonials
              </span>
              {usesMockFallback.any && (
                <span className="rounded-full bg-amber-300/20 px-4 py-2 text-amber-100 ring-1 ring-amber-200/30">
                  Mock fallback active (non-production)
                </span>
              )}
            </div>

            {headerSlides.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                {headerSlides.map((slide, index) => {
                  const isActive = index === safeActiveSlideIndex
                  return (
                    <button
                      key={slide._id}
                      type="button"
                      aria-label={`Go to slide ${index + 1}`}
                      onClick={() => setActiveSlideIndex(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        isActive ? 'w-10 bg-cyan-300' : 'w-2.5 bg-white/35 hover:bg-white/60'
                      }`}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-cyan-400/30 blur-2xl" />
            <div className="absolute -bottom-4 right-0 h-28 w-28 rounded-full bg-pink-400/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur">
              {currentSlide?.image ? (
                <img
                  src={currentSlide.image}
                  alt={currentSlide.heading ?? 'Featured slide'}
                  className="h-[24rem] w-full rounded-[1.5rem] object-cover"
                />
              ) : (
                <div className="flex h-[24rem] items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-cyan-500/20 via-white/5 to-fuchsia-500/20 px-10 text-center">
                  <div className="space-y-3">
                    <div className="mx-auto h-16 w-16 rounded-2xl border border-white/15 bg-white/10" />
                    <p className="text-lg font-semibold text-white">Header imagery will appear here</p>
                    <p className="text-sm leading-6 text-slate-200">
                      Add slider content in the backend to spotlight a campaign, product launch, or
                      client story.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className={sectionShell}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Featured Products
            </p>
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
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {loadingCards(3, 'rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm')}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.map((product) => (
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
                        <div className="flex h-44 items-center justify-center text-sm text-slate-500">
                          No product image
                        </div>
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

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {product.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Offer</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">Rs. {product.coopan_price}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Marked</p>
                      <p className="mt-1 text-lg font-semibold text-slate-400 line-through">
                        Rs. {product.marked_price}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Base price Rs. {product.base_price}</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                      Live product
                    </span>
                  </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link to={`/products/${product._id}`} className="ui-btn-secondary text-center">
                      View details
                    </Link>
                    <button
                      type="button"
                      className="ui-btn-primary"
                      onClick={() => addToCart(product._id)}
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

      <section className={sectionShell}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Achievements
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Proof that builds trust fast</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Wins and milestones are presented as compact cards so the page feels credible at a glance.
          </p>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loadingCards(6, 'rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm')}
            </div>
          ) : featuredAchievements.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featuredAchievements.map((achievement, index) => (
                <article
                  key={achievement._id}
                  className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-brand-700 text-sm font-black text-white">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    {achievement.value && (
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                        {achievement.value}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-950">{achievement.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{achievement.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
              Achievement highlights will show here once active records are available.
            </div>
          )}
        </div>
      </section>

      <section className={sectionShell}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Testimonials
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">What people say after working together</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Short, high-confidence quotes keep the page moving while still adding social proof.
          </p>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {loadingCards(3, 'rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm')}
            </div>
          ) : featuredTestimonials.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredTestimonials.map((testimonial) => (
                <article
                  key={testimonial._id}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-100 to-brand-100 ring-1 ring-slate-200">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-brand-700">
                          {testimonial.name
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-950">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.designation}</p>
                    </div>
                  </div>

                  <p className="mt-5 text-base leading-7 text-slate-700">“{testimonial.message}”</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
              Testimonials will appear here when there are active customer quotes to feature.
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
