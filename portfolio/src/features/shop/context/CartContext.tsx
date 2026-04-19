import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { shopService, SHOP_CART_CHANGED_EVENT } from '@/features/shop/services/shopService'
import type { Cart } from '@/shared/types/shop'

interface CartContextValue {
  cart: Cart | null
  isHydrating: boolean
  isHydrated: boolean
  error: string | null
  pendingByProductId: Record<string, boolean>
  getItemQty: (productId: string) => number
  setQuantity: (productId: string, quantity: number, maxStock?: number) => Promise<void>
  addOrIncrement: (productId: string, maxStock?: number) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const MAX_QTY = 99
const LEAD_SESSION_KEY = 'portfolio.lead.session'

const clampQuantity = (quantity: number, maxStock?: number) => {
  const ceiling = Math.min(MAX_QTY, Math.max(1, maxStock ?? MAX_QTY))
  return Math.min(ceiling, Math.max(0, quantity))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingByProductId, setPendingByProductId] = useState<Record<string, boolean>>({})

  const setPending = useCallback((productId: string, pending: boolean) => {
    setPendingByProductId((prev) => {
      if (pending) return { ...prev, [productId]: true }
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }, [])

  const refreshCart = useCallback(async () => {
    try {
      const next = await shopService.getMyCart()
      setCart(next)
      setError(null)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setCart(null)
        setError(null)
        return
      }

      setError(err instanceof Error ? err.message : 'Failed to load cart')
      setCart(null)
    } finally {
      setIsHydrating(false)
    }
  }, [])

  useEffect(() => {
    const hasLeadSession = !!sessionStorage.getItem(LEAD_SESSION_KEY)
    if (!hasLeadSession) {
      setCart(null)
      setError(null)
      setIsHydrating(false)
      return
    }

    void refreshCart()
  }, [refreshCart])

  useEffect(() => {
    const onCartChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ cart?: Cart }>
      if (customEvent.detail?.cart) {
        setCart(customEvent.detail.cart)
        setError(null)
      }
    }

    window.addEventListener(SHOP_CART_CHANGED_EVENT, onCartChanged as EventListener)
    return () => window.removeEventListener(SHOP_CART_CHANGED_EVENT, onCartChanged as EventListener)
  }, [])

  useEffect(() => {
    const onSessionChanged = () => {
      const hasLeadSession = !!sessionStorage.getItem(LEAD_SESSION_KEY)
      if (!hasLeadSession) {
        setCart(null)
        setError(null)
        setIsHydrating(false)
        return
      }

      setIsHydrating(true)
      void refreshCart()
    }

    window.addEventListener('lead:session:changed', onSessionChanged)
    return () => {
      window.removeEventListener('lead:session:changed', onSessionChanged)
    }
  }, [refreshCart])

  const getItemQty = useCallback(
    (productId: string) => cart?.items.find((item) => item.productId._id === productId)?.quantity ?? 0,
    [cart],
  )

  const setQuantity = useCallback(
    async (productId: string, quantity: number, maxStock?: number) => {
      if (isHydrating) {
        throw new Error('Cart is syncing. Please wait a moment and try again.')
      }

      const normalizedQty = clampQuantity(quantity, maxStock)
      setPending(productId, true)
      try {
        const nextCart =
          normalizedQty <= 0
            ? await shopService.removeCartItem(productId)
            : await shopService.updateCartItem(productId, normalizedQty)
        setCart(nextCart)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update cart quantity')
        throw err
      } finally {
        setPending(productId, false)
      }
    },
    [isHydrating, setPending],
  )

  const addOrIncrement = useCallback(
    async (productId: string, maxStock?: number) => {
      if (isHydrating) {
        throw new Error('Cart is syncing. Please wait a moment and try again.')
      }

      const currentQty = getItemQty(productId)
      const nextQty = clampQuantity(currentQty + 1, maxStock)
      if (nextQty <= 0) return

      setPending(productId, true)
      try {
        const nextCart = currentQty > 0
          ? await shopService.updateCartItem(productId, nextQty)
          : await shopService.addToCart(productId, 1)
        setCart(nextCart)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add product to cart')
        throw err
      } finally {
        setPending(productId, false)
      }
    },
    [getItemQty, setPending],
  )

  const value = useMemo(
    () => ({
      cart,
      isHydrating,
      isHydrated: !isHydrating,
      error,
      pendingByProductId,
      getItemQty,
      setQuantity,
      addOrIncrement,
      refreshCart,
    }),
    [addOrIncrement, cart, error, getItemQty, isHydrating, pendingByProductId, refreshCart, setQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
