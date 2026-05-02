import { useMemo } from 'react'
import type { Achievement, Product, Testimonial } from '@/shared/types/content'

interface UseHomeFeaturedContentArgs {
  topProducts: Product[]
  topTestimonials: Testimonial[]
  topAchievements: Achievement[]
}

export function useHomeFeaturedContent({
  topProducts,
  topTestimonials,
  topAchievements,
}: UseHomeFeaturedContentArgs) {
  const featuredProducts = useMemo(() => topProducts.slice(0, 5), [topProducts])
  const featuredTestimonials = useMemo(() => topTestimonials.slice(0, 3), [topTestimonials])
  const featuredAchievements = useMemo(() => topAchievements.slice(0, 6), [topAchievements])

  return {
    featuredProducts,
    featuredTestimonials,
    featuredAchievements,
  }
}
