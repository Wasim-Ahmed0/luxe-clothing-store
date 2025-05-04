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

  const nextStep = () =>
    setCurrentStep((s) =>
      s === "summary" ? "payment" : s === "payment" ? "confirmation" : s
    )
  const prevStep = () =>
    setCurrentStep((s) =>
      s === "confirmation" ? "payment" : s === "payment" ? "summary" : s
    )

  const handlePaymentChange = (
    field: keyof PaymentDetails,
    value: string
  ) => {
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

  // read the store_id cookie or fall back to the public env var
  const getStoreId = (): string => {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|;\s*)store_id=([^;]+)/)
      if (m?.[1]) return m[1]
    }
    return process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
  }


  const submitPayment = async () => {
    setLoading(true)
    setError(null)

    try {
      //  pull cart_id and store_id from cookies
      const cookieMap = document.cookie
        .split("; ")
        .reduce<Record<string,string>>((acc, pair) => {
          const [k,v] = pair.split("=")
          acc[k] = v
          return acc
        }, {})
      const cart_id = cookieMap["cart_id"]
      if (!cart_id) throw new Error("No cart ID")

      // 2) Create the order
      const createRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id }),
      })
      const createData = await createRes.json()
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || "Failed to create order")
      }
      const { order_id } = createData

      // 3) Immediately mark it completed
      const store_id = getStoreId();
      const statusRes = await fetch(`/api/orders/${order_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", cart_id, store_id }),
      })
      const statusData = await statusRes.json()
      if (!statusRes.ok || !statusData.success) {
        throw new Error(statusData.error || "Failed to complete order")
      }

      // 4) Clear local cart state
      clearCart()

      // 5) Build an Order object for the confirmation view
      setOrder({
        order_id,
        created_at: new Date().toISOString(),
        total_amount: cartTotal,
        items: cartItems.map((it) => ({
          variant_id: it.variant_id,
          image: it.image,
          name: it.name,
          color: it.color,
          size: it.size,
          quantity: it.quantity,
          price_at_purchase: it.price,
        })),
      })

      // 6) Advance to confirmation
      nextStep()
    } catch (e: any) {
      console.error(e)
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
    nextStep,
    prevStep,
    submitPayment,
    isPaymentValid,
  }
}
