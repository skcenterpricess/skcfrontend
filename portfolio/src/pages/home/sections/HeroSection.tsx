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
    <div className="rounded-2xl bg-[#f3f4f6] p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

        {/* LEFT SECTION */}
        <div className="space-y-6">

          {/* TAGLINE */}
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-600">
            HAR DARWAZE KI MAJBOOTI, HAMARI PEHCHAN
          </div>

          {/* ORANGE STRIP */}
          <div className="flex items-center gap-3">

            {/* LEFT NUMBER */}
            <div
              className="bg-[#0f2a44] text-white px-4 py-2 font-bold"
              style={{ clipPath: 'polygon(12% 0, 100% 0, 88% 100%, 0% 100%)' }}
            >
              {safeActiveSlideIndex + 1}
            </div>

            {/* MAIN TITLE */}
            <div
              className="flex-1 bg-[#f58220] text-white px-6 py-3 font-bold text-lg tracking-wide"
              style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)' }}
            >
              {currentSlide?.heading ?? heroFallback.heading}
            </div>

            {/* RIGHT RANGE */}
            {/* <div
              className="bg-[#0f2a44] text-white px-4 py-2 font-semibold"
              style={{ clipPath: 'polygon(12% 0, 100% 0, 88% 100%, 0% 100%)' }}
            >
              {/* {currentSlide?.range ?? '1-2'} 
            </div> */}
          </div>

          {/* DESCRIPTION */}
          <p className="max-w-xl text-gray-700 leading-7">
            {currentSlide?.description ?? heroFallback.description}
          </p>

          {/* INFO TAGS */}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-md bg-white px-4 py-2 shadow-sm border">
              Live products, pricing & stock
            </span>

            {usesMockFallbackAny && (
              <span className="rounded-md bg-yellow-100 px-4 py-2 text-yellow-700 border">
                Mock fallback active
              </span>
            )}
          </div>

          {/* SLIDER INDICATORS */}
          {headerSlides.length > 1 && (
            <div className="flex gap-2 pt-2">
              {headerSlides.map((_, index) => {
                const isActive = index === safeActiveSlideIndex
                return (
                  <button
                    key={index}
                    onClick={() => onSlideSelect(index)}
                    className={`h-2 w-8 rounded-sm transition ${
                      isActive ? 'bg-[#f58220]' : 'bg-gray-300'
                    }`}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT IMAGE */}
        <div className="rounded-xl overflow-hidden bg-white border shadow-sm">
          {currentSlide?.image ? (
            <img
              src={currentSlide.image}
              alt={currentSlide.heading ?? 'Slide'}
              className="h-[20rem] w-full object-cover"
            />
          ) : (
            <div className="flex h-[20rem] items-center justify-center text-gray-500">
              No Image Available
            </div>
          )}
        </div>

      </div>
    </div>
  )
}