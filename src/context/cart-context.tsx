// import { createContext, useContext, useEffect, useState, ReactNode } from "react"

// // UI-side cart item
// export interface UICartItem {
//   id: string            // cart_item_id
//   variant_id: string    
//   quantity: number
//   price: number         // price_at_time
//   name: string
//   image: string
//   color: string
//   size: string
// }

// interface CartContextType {
//   items: UICartItem[]
//   addItem: (variantId: string, quantity: number) => Promise<void>
//   removeItem: (itemId: string) => Promise<void>
//   updateQuantity: (itemId: string, quantity: number) => Promise<void>
//   clearCart: () => Promise<void>
//   isCartOpen: boolean
//   openCart: () => void
//   closeCart: () => void
//   toggleCart: () => void
//   cartCount: number
//   cartTotal: number
// }

// const CartContext = createContext<CartContextType>({} as CartContextType)
// export const useCart = () => useContext(CartContext)

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [items, setItems] = useState<UICartItem[]>([])
//   const [cartId, setCartId] = useState<string | null>(null)
//   const [isCartOpen, setIsCartOpen] = useState(false)

//   // helper to read store_id cookie or fallback
//   const getStoreId = (): string | null => {
//     if (typeof document !== 'undefined') {
//       const m = document.cookie.match(/(?:^|;\s*)store_id=([^;]+)/)
//       if (m?.[1]) return m[1]
//     }
//     return process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!;
//   }

//   // On mount, read existing cart_id cookie (but do NOT auto-create)
//   useEffect(() => {
//     if (typeof document !== 'undefined') {
//       const m = document.cookie.match(/(?:^|;\s*)cart_id=([^;]+)/)
//       if (m?.[1]) {
//         const existingId = m[1]
//         setCartId(existingId)
//         // fetch existing items
//         fetch(`/api/virtual-carts/${existingId}`)
//           .then((res) => res.json())
//           .then((data) => {
//             if (data.success) {
//               setItems(
//                 data.cart.items.map((i: any) => ({
//                   id: i.cart_item_id,
//                   variant_id: i.variant.variant_id,
//                   quantity: i.quantity,
//                   price: i.price_at_time,
//                   name: i.variant.product.name,
//                   image: '',
//                   color: i.variant.color,
//                   size: i.variant.size,
//                 }))
//               )
//             }
//           })
//           .catch(() => {})
//       }
//     }
//   }, [])

//   // Helper: ensure cart exists before operations
//   const ensureCart = async (): Promise<string> => {
//     if (cartId) return cartId
//     // create a new cart with store_id
//     const store_id = getStoreId()
//     const res = await fetch('/api/virtual-carts', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ store_id }),
//     })
//     const data = await res.json()
//     if (!data.success) throw new Error('Cart creation failed')
//     const newId = data.cart.cart_id
//     setCartId(newId)
//     document.cookie = `cart_id=${newId};path=/;max-age=${60*60*24}`
//     return newId
//   }

//   // Add or update item
//   const addItem = async (variantId: string, quantity: number) => {
//     const id = await ensureCart()
//     const res = await fetch(`/api/virtual-carts/${id}/items`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ variant_id: variantId, quantity }),
//     })
//     const data = await res.json()
//     if (data.success) {
//       const newItem = data.item
//       setItems((prev) => {
//         const idx = prev.findIndex((it) => it.variant_id === newItem.variant_id)
//         if (idx > -1) {
//           const updated = [...prev]
//           updated[idx].quantity = newItem.quantity
//           return updated
//         }
//         return [
//           ...prev,
//           {
//             id: newItem.cart_item_id,
//             variant_id: newItem.variant_id,
//             quantity: newItem.quantity,
//             price: newItem.price_at_time,
//             name: '',
//             image: '',
//             color: '',
//             size: '',
//           },
//         ]
//       })
//       setIsCartOpen(true)
//     }
//   }

//   // Remove item
//   const removeItem = async (itemId: string) => {
//     if (!cartId) return
//     await fetch(`/api/virtual-carts/${cartId}/items/${itemId}`, { method: 'DELETE' })
//     setItems((prev) => prev.filter((it) => it.id !== itemId))
//   }

//   // Update quantity
//   const updateQuantity = async (itemId: string, quantity: number) => {
//     if (!cartId) return
//     if (quantity <= 0) {
//       await removeItem(itemId)
//       return
//     }
//     const res = await fetch(`/api/virtual-carts/${cartId}/items/${itemId}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ quantity }),
//     })
//     const data = await res.json()
//     if (data.success) {
//       setItems((prev) =>
//         prev.map((it) =>
//           it.id === itemId ? { ...it, quantity: data.item.quantity } : it
//         )
//       )
//     }
//   }

//   // Clear cart
//   const clearCart = async () => {
//     setItems([])
//   }

//   const cartCount = items.reduce((sum, it) => sum + it.quantity, 0)
//   const cartTotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)

//   return (
//     <CartContext.Provider
//       value={{
//         items,
//         addItem,
//         removeItem,
//         updateQuantity,
//         clearCart,
//         isCartOpen,
//         openCart: () => setIsCartOpen(true),
//         closeCart: () => setIsCartOpen(false),
//         toggleCart: () => setIsCartOpen((o) => !o),
//         cartCount,
//         cartTotal,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   )
// }

// context/cart-context.tsx
// context/cart-context.tsx
// context/cart-context.tsx
// context/cart-context.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"

export interface UICartItem {
  id: string            // cart_item_id
  variant_id: string
  quantity: number
  price: number         // price_at_time
  name: string
  image: string
  color: string
  size: string
}

interface CartContextType {
  items: UICartItem[]
  addItem: (variantId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType>({} as CartContextType)
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [items, setItems] = useState<UICartItem[]>([])
  const [cartId, setCartId] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const getStoreId = (): string => {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|;\s*)store_id=([^;]+)/)
      if (m?.[1]) return m[1]
    }
    return process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
  }

  // fetch + hydrate
  const fetchCartItems = async (id: string) => {
    try {
      const res = await fetch(`/api/virtual-carts/${id}`)
      if (!res.ok) throw new Error("Cart not found")
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Fetch failed")
      setItems(
        data.cart.items.map((i: any) => ({
          id: i.cart_item_id,
          variant_id: i.variant.variant_id,
          quantity: i.quantity,
          price: i.price_at_time,
          name: i.variant.product.name,
          image: "",
          color: i.variant.color,
          size: i.variant.size,
        }))
      )
    } catch {
      // stale cart
      document.cookie = `cart_id=;path=/;max-age=0`
      setCartId(null)
      setItems([])
    }
  }

  // 1) on mount, seed cartId from cookie (no fetch yet)
  useEffect(() => {
    if (typeof document === "undefined") return
    const m = document.cookie.match(/(?:^|;\s*)cart_id=([^;]+)/)
    if (m?.[1]) setCartId(m[1])
  }, [])

  // 2) on every page navigation, re-read cookie and re-fetch
  useEffect(() => {
    if (typeof document === "undefined") return
    const m = document.cookie.match(/(?:^|;\s*)cart_id=([^;]+)/)
    const existing = m?.[1] ?? null

    if (existing) {
      setCartId(existing)
      fetchCartItems(existing)
    } else {
      // no cookie → clear
      setCartId(null)
      setItems([])
    }
  }, [router.asPath])

  // 3) claim on login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const cookieCartId = document.cookie
        .split("; ")
        .find((c) => c.startsWith("cart_id="))
        ?.split("=")[1]
      if (cookieCartId) {
        fetch("/api/virtual-carts/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart_id: cookieCartId }),
        }).catch(console.error)
      }
    }
  }, [status, session?.user?.id])

  const ensureCart = async (): Promise<string> => {
    if (cartId) {
      const res = await fetch(`/api/virtual-carts/${cartId}`)
      if (res.ok) return cartId
      // otherwise stale
      document.cookie = `cart_id=;path=/;max-age=0`
      setCartId(null)
      setItems([])
    }
    const store_id = getStoreId()
    const createRes = await fetch("/api/virtual-carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_id }),
    })
    const createData = await createRes.json()
    if (!createData.success) throw new Error("Cart creation failed")
    const newId = createData.cart.cart_id
    document.cookie = `cart_id=${newId};path=/;max-age=${60 * 60 * 24}`
    setCartId(newId)
    return newId
  }

  const addItem = async (variantId: string, quantity: number) => {
    const id = await ensureCart()
    const res = await fetch(`/api/virtual-carts/${id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variantId, quantity }),
    })
    const data = await res.json()
    if (data.success && data.item) {
      const newItem = data.item
      setItems((prev) => {
        const idx = prev.findIndex((it) => it.variant_id === newItem.variant_id)
        if (idx > -1) {
          const copy = [...prev]
          copy[idx].quantity = newItem.quantity
          return copy
        }
        return [
          ...prev,
          {
            id: newItem.cart_item_id,
            variant_id: newItem.variant_id,
            quantity: newItem.quantity,
            price: newItem.price_at_time,
            name: "",
            image: "",
            color: "",
            size: "",
          },
        ]
      })
      setIsCartOpen(true)
    }
  }

  const removeItem = async (itemId: string) => {
    if (!cartId) return
    await fetch(`/api/virtual-carts/${cartId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart_item_id: itemId }),
    })
    setItems((prev) => prev.filter((it) => it.id !== itemId))
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cartId) return
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }
    const res = await fetch(`/api/virtual-carts/${cartId}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    })
    const data = await res.json()
    if (data.success && data.item) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, quantity: data.item.quantity } : it
        )
      )
    }
  }

  const clearCart = async () => {
    setItems([])
  }

  const cartCount = items.reduce((sum, it) => sum + it.quantity, 0)
  const cartTotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((o) => !o),
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
