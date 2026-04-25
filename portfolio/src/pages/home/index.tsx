import { useContent } from '@/features/content/context/ContentContext'
import { useHeroCarousel } from '@/pages/home/hooks/useHeroCarousel'
import { useHomeFeaturedContent } from '@/pages/home/hooks/useHomeFeaturedContent'
import { useCartFeedback } from '@/pages/home/hooks/useCartFeedback'
import { HeroSection } from '@/pages/home/sections/HeroSection'
import { BrandSection } from '@/pages/home/sections/BrandSection'
import { FeaturedProductsSection } from '@/pages/home/sections/FeaturedProductsSection'
import { AchievementsSection } from '@/pages/home/sections/AchievementsSection'
import { TestimonialsSection } from '@/pages/home/sections/TestimonialsSection'

export default function HomePage() {
  const { headerSlides, topProducts, topTestimonials, topAchievements, isLoading, usesMockFallback } = useContent()
  const { safeActiveSlideIndex, setActiveSlideIndex } = useHeroCarousel({ slideCount: headerSlides.length })
  const { featuredProducts, featuredTestimonials, featuredAchievements } = useHomeFeaturedContent({
    topProducts,
    topTestimonials,
    topAchievements,
  })
  const { cartStatus, cartError} = useCartFeedback()

  return (
    <section className="space-y-8 pb-4">
      <HeroSection
        headerSlides={headerSlides}
        usesMockFallbackAny={usesMockFallback.any}
        safeActiveSlideIndex={safeActiveSlideIndex}
        onSlideSelect={setActiveSlideIndex}
      />
      <BrandSection />
      <FeaturedProductsSection
        isLoading={isLoading}
        products={featuredProducts}
        cartStatus={cartStatus}
        cartError={cartError}
        // onAddToCart={addToCart}
      />
      <AchievementsSection isLoading={isLoading} achievements={featuredAchievements} />
      <TestimonialsSection isLoading={isLoading} testimonials={featuredTestimonials} />
    </section>
  )
}
