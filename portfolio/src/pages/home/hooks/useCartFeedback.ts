import { useCallback, useState } from 'react'
import { shopService } from '@/features/shop/services/shopService'

export function useCartFeedback() {
  const [cartStatus, setCartStatus] = useState<string | null>(null)
  const [cartError, setCartError] = useState<string | null>(null)

  const addToCart = useCallback(async (productId: string) => {
    try {
      await shopService.addToCart(productId, 1)
      setCartStatus('Product added to cart. Open cart to place your order.')
      setCartError(null)
    } catch (err) {
      setCartStatus(null)
      setCartError(err instanceof Error ? err.message : 'Please sign in as lead to add product in cart.')
    }
  }, [])

  return {
    cartStatus,
    cartError,
    addToCart,
  }
}
