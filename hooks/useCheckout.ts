import { useState } from "react"
import { useCart } from "@/context/cart-context"
import type { PaymentDetails, Order } from "../types/checkout"

type Step = "summary" | "payment" | "confirmation"

export default function useCheckout() {
  const { items: cartItems, cartTotal, clearCart } = useCart()

  const [currentStep, setCurrentStep] = useState<Step>("summary")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })
  const [order, setOrder] = useState<Order | null>(null)

  // helper to read cart_id cookie
  const getCartId = (): string | null => {
    if (typeof document === "undefined") return null
    const m = document.cookie.match(/(?:^|;\s*)cart_id=([^;]+)/)
    return m?.[1] ?? null
  }

  // helper to read store_id cookie + default to online store id if no cookie found
  const getStoreId = (): string => {
    if (typeof window === "undefined") {
      return process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
    }
    const m = document.cookie.match(/(?:^|;\s*)store_id=([^;]+)/)
    if (m?.[1]) return m[1]

    return process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
  } 

  // Create order on Summary → Payment/QR transition
  const createOrder = async () => {
    const cart_id = getCartId()
    if (!cart_id) throw new Error("No cart_id cookie")
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart_id }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to create order")
    }
    // build our Order object from cartItems + API response
    const newOrder: Order = {
      order_id:     data.order_id,
      created_at:   new Date().toISOString(),
      total_amount: cartTotal,
      items:        cartItems.map((it) => ({
        variant_id:        it.variant_id,
        image:             it.image,
        name:              it.name,
        color:             it.color,
        size:              it.size,
        quantity:          it.quantity,
        price_at_purchase: it.price,
      })),
    }
    setOrder(newOrder)
    return data.order_id
  }

  // Move next only after order exists (and only create once on summary)
  const handleNext = async () => {
    setLoading(true)
    setError(null)
    try {
      if (currentStep === "summary") {
        // first transition: actually create the order
        await createOrder()
        setCurrentStep("payment")
      } else if (currentStep === "payment") {
        // second transition: skip creation, go to confirmation
        setCurrentStep("confirmation")
      }
      // if already on confirmation, do nothing
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const prevStep = () =>
    setCurrentStep((s) =>
      s === "confirmation" ? "payment" : s === "payment" ? "summary" : s
    )

  const handlePaymentChange = (field: keyof PaymentDetails, value: string) => {
    setPaymentDetails((pd) => ({ ...pd, [field]: value }))
  }

  const isPaymentValid = (): boolean => {
    const { cardNumber, cardHolder, expiryDate, cvv } = paymentDetails
    const digitsOnly = cardNumber.replace(/\s+/g, "")
    return (
      /^\d{13,19}$/.test(digitsOnly) &&
      cardHolder.trim().length > 0 &&
      /^\d{2}\/\d{2}$/.test(expiryDate) &&
      /^\d{3}$/.test(cvv)
    )
  }

  // Only mark as completed here—order already exists
  const submitPayment = async () => {
    if (!order) return
    setLoading(true)
    setError(null)
    try {
      const cart_id = getCartId();
      const store_id = getStoreId();
      const res = await fetch(`/api/orders/${order.order_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", cart_id, store_id }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to complete order")
      }
      clearCart()
      setCurrentStep("confirmation")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    currentStep,
    order,
    loading,
    error,
    paymentDetails,
    handlePaymentChange,
    nextStep: handleNext,
    prevStep,
    submitPayment,
    isPaymentValid,
  }
}
