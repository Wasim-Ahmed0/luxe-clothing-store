import React, { useEffect, useState } from "react"
import { useRouter }        from "next/router"
import "@/styles/animations.css"

import Navbar           from "@/components/layout/Navbar"
import Footer           from "@/components/layout/Footer"
import OrderSummary     from "@/components/checkout/OrderSummary"
import PaymentForm      from "@/components/checkout/PaymentForm"
import ConfirmationView from "@/components/checkout/ConfirmationView"
import InStoreQRCode    from "@/components/checkout/InStoreQRCode"
import useCheckout      from "../../../hooks/useCheckout"
import { useCart }      from "@/context/cart-context"
import type { Order }   from "../../../types/checkout"

export default function CheckoutPage() {
  const router = useRouter()
  const { items: cartItems, cartTotal } = useCart()
  const {
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
  } = useCheckout()

  // Redirect to /shop if cart empty at summary
  useEffect(() => {
    if (!router.isReady) return
    if (currentStep === "summary" && cartItems.length === 0) {
      router.replace("/shop")
    }
  }, [router.isReady, currentStep, cartItems.length, router])

  // Determine in‑store vs online
  const defaultStore = process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
  const [isInStore, setIsInStore] = useState(false)
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)store_id=([^;]+)/)
    const storeId = m?.[1] ?? defaultStore
    setIsInStore(storeId !== defaultStore)
  }, [])

  const stepIndex = { summary: 1, payment: 2, confirmation: 3 }[currentStep]!

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1,2,3].map((n) => (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stepIndex>=n ? "bg-amber-900 text-white":"bg-gray-200 text-stone-700"
                    }`}>{n}</div>
                    <span className="text-sm mt-1 font-medium text-stone-900">
                      {n===1?"Summary": n===2?"Payment":"Confirmation"}
                    </span>
                  </div>
                  {n<3 && <div className={`flex-1 h-1 mx-2 transition-colors duration-200 ${
                    stepIndex>n ? "bg-amber-700":"bg-gray-200"
                  }`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">

            {/* SUMMARY STEP */}
            {currentStep==="summary" && (
              <OrderSummary
                order={{
                  order_id:    "",
                  created_at:  new Date().toISOString(),
                  total_amount: cartTotal,
                  items:       cartItems.map((it) => ({
                    variant_id:        it.variant_id,
                    quantity:          it.quantity,
                    price_at_purchase: it.price,
                    image:             it.image,
                    name:              it.name,
                    color:             it.color,
                    size:              it.size,
                  })),
                } as Order}
                onNext={nextStep}
              />
            )}

            {/* PAYMENT or IN‑STORE QR STEP */}
            {currentStep==="payment" && (
              isInStore
                ? <InStoreQRCode orderId={order!.order_id} onComplete={nextStep} />
                : <PaymentForm
                    paymentDetails={paymentDetails}
                    onChange={handlePaymentChange}
                    onBack={prevStep}
                    onSubmit={submitPayment}
                    isValid={isPaymentValid()}
                    isLoading={loading}
                  />
            )}

            {/* CONFIRMATION STEP */}
            {currentStep==="confirmation" && order && (
              <ConfirmationView order={order} />
            )}

            {/* ERROR */}
            {error && (
              <div className="text-red-500 text-center mt-4">{error}</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
