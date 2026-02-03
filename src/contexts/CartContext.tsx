import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '../types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity: number, weight_g?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number, weight_g?: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'juancito_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product: Product, quantity: number, weight_g?: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => {
        if (product.product_type === 'weighted' && weight_g) {
          return item.product_id === product.id && item.weight_g === weight_g
        }
        return item.product_id === product.id
      })

      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id && 
          (product.product_type !== 'weighted' || item.weight_g === weight_g)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      const price = product.product_type === 'weighted' && weight_g && product.price_per_kg
        ? Math.round((product.price_per_kg * weight_g) / 1000)
        : (product.price || 0)

      return [...prev, {
        product_id: product.id,
        product,
        quantity,
        weight_g,
        price,
      }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number, weight_g?: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId && 
        (weight_g === undefined || item.weight_g === weight_g)
          ? { ...item, quantity, weight_g }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
