import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

export interface FitRequest {
  request_id: string
  variant_id: string
  status: 'pending' | 'completed'
  created_at: string
}

interface FittingCartContextType {
  fitCartId: string | null
  requests: FitRequest[]
  addRequest: (variantId: string, fittingRoomId?: string) => Promise<void>
  removeRequest: (requestId: string) => Promise<void>
  transferToCart: () => Promise<string>
}

const FittingCartContext = createContext<FittingCartContextType | undefined>(undefined)
export function useFittingCart(): FittingCartContextType {
  const ctx = useContext(FittingCartContext)
  if (!ctx) throw new Error('useFittingCart must be used within a FittingCartProvider')
  return ctx
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
  return m?.[1] ?? null
}

export function FittingCartProvider({ children }: { children: ReactNode }) {
  const [fitCartId, setFitCartId] = useState<string | null>(null)
  const [requests, setRequests] = useState<FitRequest[]>([])

  // — on mount, pick up any existing (unlikely now) fitting_cart_id cookie
  useEffect(() => {
    const existing = readCookie('fitting_cart_id')
    if (existing) setFitCartId(existing)
  }, [])

  // — whenever the cart ID changes, re-fetch its requests
  useEffect(() => {
    if (!fitCartId) {
      setRequests([])
      return
    }

    fetch(`/api/fitting-carts/${fitCartId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error)
        const cart = (json as any).fittingCart || (json as any).cart
        setRequests(cart.requests.map((r: any) => ({
          request_id: r.request_id,
          variant_id: r.variant_id,
          status:     r.status,
          created_at: r.created_at,
        })))
      })
      .catch(() => {
        document.cookie = 'fitting_cart_id=;path=/;max-age=0'
        setFitCartId(null)
        setRequests([])
      })
  }, [fitCartId])


  // helper to force-create a brand-new cart
  const createNewCart = async (): Promise<string> => {
    // 1) clear out any old
    document.cookie = 'fitting_cart_id=;path=/;max-age=0'
    setFitCartId(null)
    setRequests([])

    // 2) POST → always create (server will make fresh)
    const store_id = readCookie('store_id') ?? process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
    const res = await fetch('/api/fitting-carts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create fitting cart')
    }

    // 3) persist new ID
    const id = data.fitting_cart_id as string
    setFitCartId(id)
    document.cookie = `fitting_cart_id=${id};path=/;max-age=${60 * 60 * 24}`
    return id
  }

  // always new cart → then add exactly one request
  const addRequest = async (variantId: string, fittingRoomId?: string) => {
    const id = await createNewCart()
    const res = await fetch(`/api/fitting-carts/${id}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant_id: variantId, fitting_room_id: fittingRoomId }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to add fitting request')
    }
    // show just that one
    setRequests([{
      request_id: data.request_id,
      variant_id: variantId,
      status:     'pending',
      created_at: new Date().toISOString(),
    }])
  }

  const removeRequest = async (requestId: string) => {
    if (!fitCartId) throw new Error('No fitting cart to remove from')
    const res = await fetch(`/api/fitting-carts/${fitCartId}/requests/${requestId}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to remove fitting request')
    }
    setRequests((prev) => prev.filter((r) => r.request_id !== requestId))
  }

  const transferToCart = async (): Promise<string> => {
    if (!fitCartId) throw new Error('No fitting cart to transfer')
    const res = await fetch(`/api/fitting-carts/${fitCartId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Transfer failed')
    }
    // once transferred, clear out the try-on cart
    document.cookie = 'fitting_cart_id=;path=/;max-age=0'
    setFitCartId(null)
    setRequests([])
    return (data.cart_id || data.virtual_cart_id) as string
  }

  return (
    <FittingCartContext.Provider
      value={{ fitCartId, requests, addRequest, removeRequest, transferToCart }}
    >
      {children}
    </FittingCartContext.Provider>
  )
}
