import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import type { Order, PaymentDetails } from '../types/checkout'

type Step = 'summary' | 'payment' | 'confirmation'

export default function useCheckout() {
  const router = useRouter()
  const { orderID, token } = router.query as {
    orderID?: string
    token?: string
  }

  const [order, setOrder] = useState<Order | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>('summary')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  })

  useEffect(() => {
    if (!router.isReady) return
    if (!orderID || !token) {
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/orders/${orderID}?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error)
          return
        }
        // map details → items, adding the fields OrderSummary expects
        const api = data.order
        const items = api.details.map((d) => ({
          variant_id:        d.variant_id,
          quantity:          d.quantity,
          price_at_purchase: d.price_at_purchase,
          // for now use placeholders; if you have product images/names you'll fetch them separately
          image: '/placeholder.svg',
          name:  d.variant_id,
          color: '',
          size:  '',
        }))
        setOrder({
          order_id:     api.order_id,
          created_at:   api.created_at,
          total_amount: api.total_amount,
          items,
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [router.isReady, orderID, token])

  const nextStep = () =>
    setCurrentStep((s) =>
      s === 'summary'
        ? 'payment'
        : s === 'payment'
        ? 'confirmation'
        : s
    )
  const prevStep = () =>
    setCurrentStep((s) =>
      s === 'confirmation'
        ? 'payment'
        : s === 'payment'
        ? 'summary'
        : s
    )

  const handlePaymentChange = (
    field: keyof PaymentDetails,
    value: string
  ) => {
    setPaymentDetails((pd) => ({ ...pd, [field]: value }))
  }

  const isPaymentValid = (): boolean => {
    const { cardNumber, cardHolder, expiryDate, cvv } = paymentDetails
    const digitsOnly = cardNumber.replace(/\s+/g, '')
    return (
      /^\d{13,19}$/.test(digitsOnly) &&
      cardHolder.trim().length > 0 &&
      /^\d{2}\/\d{2}$/.test(expiryDate) &&
      /^\d{3}$/.test(cvv)
    )
  }

  const submitPayment = async () => {
    if (!orderID) return
    setLoading(true)
    await fetch(`/api/orders/${orderID}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    setLoading(false)
    nextStep()
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
