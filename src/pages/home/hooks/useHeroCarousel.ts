import { useEffect, useMemo, useState } from 'react'

interface UseHeroCarouselArgs {
  slideCount: number
  intervalMs?: number
}

export function useHeroCarousel({ slideCount, intervalMs = 5000 }: UseHeroCarouselArgs) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  useEffect(() => {
    if (slideCount <= 1) return undefined

    const timer = window.setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slideCount)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [slideCount, intervalMs])

  const safeActiveSlideIndex = useMemo(
    () => (slideCount ? activeSlideIndex % slideCount : 0),
    [activeSlideIndex, slideCount],
  )

  return {
    activeSlideIndex,
    safeActiveSlideIndex,
    setActiveSlideIndex,
  }
}
