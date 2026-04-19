import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { contentService } from '@/features/content/services/contentService'
import {
  mockAchievements,
  mockHeaderSlides,
  mockProducts,
  mockTestimonials,
} from '@/features/content/mockData'
import type { Achievement, HeaderSidebar, Product, Testimonial } from '@/shared/types/content'

interface ContentContextValue {
  headerSlides: HeaderSidebar[]
  topProducts: Product[]
  topTestimonials: Testimonial[]
  topAchievements: Achievement[]
  isLoading: boolean
  usesMockFallback: {
    headerSlides: boolean
    topProducts: boolean
    topTestimonials: boolean
    topAchievements: boolean
    any: boolean
  }
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [headerSlides, setHeaderSlides] = useState<HeaderSidebar[]>([])
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [topTestimonials, setTopTestimonials] = useState<Testimonial[]>([])
  const [topAchievements, setTopAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [usesMockFallback, setUsesMockFallback] = useState({
    headerSlides: false,
    topProducts: false,
    topTestimonials: false,
    topAchievements: false,
    any: false,
  })

  const emptyDataFallbackEnabled = !import.meta.env.PROD && import.meta.env.VITE_ENABLE_EMPTY_DATA_MOCK !== 'false'

  const bootstrap = useCallback(async () => {
    try {
      const [slides, products, testimonials, achievements] = await Promise.all([
        contentService.getHeaderSlides(5),
        contentService.getTopProducts(5),
        contentService.getTopTestimonials(5),
        contentService.getTopAchievements(6),
      ])

      const shouldUseMockSlides = emptyDataFallbackEnabled && slides.length === 0
      const shouldUseMockProducts = emptyDataFallbackEnabled && products.length === 0
      const shouldUseMockTestimonials = emptyDataFallbackEnabled && testimonials.length === 0
      const shouldUseMockAchievements = emptyDataFallbackEnabled && achievements.length === 0

      setHeaderSlides(shouldUseMockSlides ? mockHeaderSlides : slides)
      setTopProducts(shouldUseMockProducts ? mockProducts : products)
      setTopTestimonials(shouldUseMockTestimonials ? mockTestimonials : testimonials)
      setTopAchievements(shouldUseMockAchievements ? mockAchievements : achievements)
      setUsesMockFallback({
        headerSlides: shouldUseMockSlides,
        topProducts: shouldUseMockProducts,
        topTestimonials: shouldUseMockTestimonials,
        topAchievements: shouldUseMockAchievements,
        any:
          shouldUseMockSlides ||
          shouldUseMockProducts ||
          shouldUseMockTestimonials ||
          shouldUseMockAchievements,
      })
    } catch {
      if (emptyDataFallbackEnabled) {
        setHeaderSlides(mockHeaderSlides)
        setTopProducts(mockProducts)
        setTopTestimonials(mockTestimonials)
        setTopAchievements(mockAchievements)
        setUsesMockFallback({
          headerSlides: true,
          topProducts: true,
          topTestimonials: true,
          topAchievements: true,
          any: true,
        })
      } else {
        setHeaderSlides([])
        setTopProducts([])
        setTopTestimonials([])
        setTopAchievements([])
        setUsesMockFallback({
          headerSlides: false,
          topProducts: false,
          topTestimonials: false,
          topAchievements: false,
          any: false,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [emptyDataFallbackEnabled])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const value = useMemo(
    () => ({
      headerSlides,
      topProducts,
      topTestimonials,
      topAchievements,
      isLoading,
      usesMockFallback,
    }),
    [headerSlides, topProducts, topTestimonials, topAchievements, isLoading, usesMockFallback],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) {
    throw new Error('useContent must be used within ContentProvider')
  }

  return ctx
}
