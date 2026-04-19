import type { HeaderSidebar } from '@/shared/types/content'
import { heroFallback } from '@/pages/home/constants'

interface HeroSectionProps {
  headerSlides: HeaderSidebar[]
  usesMockFallbackAny: boolean
  safeActiveSlideIndex: number
  onSlideSelect: (index: number) => void
}

export function HeroSection({
  headerSlides,
  usesMockFallbackAny,
  safeActiveSlideIndex,
  onSlideSelect,
}: HeroSectionProps) {
  const currentSlide = headerSlides[safeActiveSlideIndex] ?? headerSlides[0]

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] bg-brand-900 px-6 py-8 text-white shadow-[0_28px_90px_rgba(180,83,9,0.3)] sm:px-8 lg:px-10 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.34),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.28),_transparent_34%),linear-gradient(128deg,_rgba(15,23,42,0.94),_rgba(120,53,15,0.88))]" />
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white backdrop-blur">
            HAR DARWAZE KI MAJBOOTI, HAMARI PEHCHAN
          </div>
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/90">SKC Hardware</p>
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              {currentSlide?.heading ?? heroFallback.heading}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
              {currentSlide?.description ?? heroFallback.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/12 px-4 py-2 text-white ring-1 ring-white/25">
              Live products, pricing, stock, and version details
            </span>
            {usesMockFallbackAny && (
              <span className="rounded-full bg-amber-200/20 px-4 py-2 text-amber-100 ring-1 ring-amber-200/45">
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
                    onClick={() => onSlideSelect(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-10 bg-accent-400 shadow-[0_0_14px_rgba(251,191,36,0.55)]' : 'w-2.5 bg-accent-100/70 hover:bg-accent-300'
                    }`}
                  />
                )
              })}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-accent-300/45 blur-2xl" />
          <div className="absolute -bottom-4 right-0 h-28 w-28 rounded-full bg-accent-500/40 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/15 p-3 shadow-2xl backdrop-blur">
            {currentSlide?.image ? (
              <img
                src={currentSlide.image}
                alt={currentSlide.heading ?? 'Featured slide'}
                className="h-[24rem] w-full rounded-[1.5rem] object-cover"
              />
            ) : (
              <div className="flex h-[24rem] items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-brand-300/25 via-white/5 to-accent-300/20 px-10 text-center">
                <div className="space-y-3">
                  <div className="mx-auto h-16 w-16 rounded-2xl border border-white/15 bg-white/10" />
                  <p className="text-lg font-semibold text-white">Header imagery will appear here</p>
                  <p className="text-sm leading-6 text-slate-100">
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
  )
}
