// // pages/checkout/index.tsx
// import '../../styles/animations.css'
// import Navbar from '@/components/layout/Navbar'
// import Footer from '@/components/layout/Footer'
// import OrderSummary from '@/components/checkout/OrderSummary'
// import PaymentForm from '@/components/checkout/PaymentForm'
// import ConfirmationView from '@/components/checkout/ConfirmationView'
// import useCheckout from '../../../hooks/useCheckout'


// import { useState } from 'react'
// import type { Order, PaymentDetails } from '../../../types/checkout'

// export default function CheckoutPage() {
//   const [step, setStep] = useState<'summary'|'payment'|'confirmation'>('summary')

//   const mockOrder: Order = {
//     order_id:     'ord_12345678',
//     created_at:   new Date().toISOString(),
//     total_amount: 120.0,
//     items: [
//       {
//         variant_id:        'var_abc123',
//         image:             '/placeholder.svg',
//         name:              'Classic Tee',
//         color:             'Navy',
//         size:              'M',
//         quantity:          2,
//         price_at_purchase: 30.0,
//       },
//       {
//         variant_id:        'var_def456',
//         image:             '/placeholder.svg',
//         name:              'Sneaker Run',
//         color:             'White',
//         size:              '9',
//         quantity:          1,
//         price_at_purchase: 60.0,
//       },
//     ],
//   }

//   // --- 2) Local state for your form fields ---
//   const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
//     cardNumber: '',
//     cardHolder: '',
//     expiryDate: '',
//     cvv:        '',
//   })

//   const isPaymentValid = (): boolean => {
//     const { cardNumber, cardHolder, expiryDate, cvv } = paymentDetails
  
//     // Strip spaces for card number length check
//     const digitsOnly = cardNumber.replace(/\s+/g, '')
  
//     return (
//         // 13–19 digits, digits only
//         /^\d{13,19}$/.test(digitsOnly) &&
//         // non‐empty name
//         cardHolder.trim().length > 0 &&
//         // MM/YY format
//         /^\d{2}\/\d{2}$/.test(expiryDate) &&
//         // three‐digit CVV
//         /^\d{3}$/.test(cvv)
//     )
//   }

//   return (
//     <>
//       <Navbar />

//       <main className="min-h-screen bg-gray-100 py-8 px-4 pt-30">
//         <div className="max-w-4xl mx-auto space-y-8">
//           {/* --- Progress Bar --- */}
//           <div className="bg-white rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between max-w-md mx-auto">
//               {/* Step 1 */}
//               <div className="flex flex-col items-center">
//                 <div
//                   className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                     (step === 'summary' || step === 'payment' || step === 'confirmation')
//                       ? 'bg-amber-900 text-white'
//                       : 'bg-gray-200 text-stone-900'
//                   }`}
//                 >
//                   1
//                 </div>
//                 <span className="text-md mt-1 font-medium text-stone-900">Summary</span>
//               </div>

//               <div
//                 className={`flex-1 h-1 mx-2 transition-colors duration-200 ${
//                   (step === 'payment' || step === 'confirmation')
//                     ? 'bg-amber-700'
//                     : 'bg-gray-200'
//                 }`}
//               />

//               {/* Step 2 */}
//               <div className="flex flex-col items-center">
//                 <div
//                   className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                     (step === 'payment' || step === 'confirmation')
//                       ? 'bg-amber-900 text-white'
//                       : 'bg-gray-200 text-stone-700'
//                   }`}
//                 >
//                   2
//                 </div>
//                 <span className="text-md mt-1 font-medium text-stone-900">Payment</span>
//               </div>

//               <div
//                 className={`flex-1 h-1 mx-2 transition-colors duration-200 ${
//                   step === 'confirmation' ? 'bg-amber-700' : 'bg-gray-200'
//                 }`}
//               />

//               {/* Step 3 */}
//               <div className="flex flex-col items-center">
//                 <div
//                   className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                     step === 'confirmation'
//                       ? 'bg-amber-900 text-white'
//                       : 'bg-gray-200 text-stone-700'
//                   }`}
//                 >
//                   3
//                 </div>
//                 <span className="text-md mt-1 font-medium text-stone-900">Confirmation</span>
//               </div>
//             </div>
//           </div>

//           {/* --- Card Container --- */}
//           <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
//             {step === 'summary' && (
//               <OrderSummary
//                 order={mockOrder}
//                 onNext={() => setStep('payment')}
//               />
//             )}
//             {step === 'payment' && (
//               <PaymentForm
//                 paymentDetails={paymentDetails}
//                 onChange={(field, value) => {
//                     setPaymentDetails(pd => ({ ...pd, [field]: value }))
//                 }}
//                 onBack={() => setStep('summary')}
//                 onSubmit={() => setStep('confirmation')}
//                 isValid={isPaymentValid()}
//                 isLoading={false}
//               />
//             )}
//             {step === 'confirmation' && (
//               <ConfirmationView order={mockOrder} />
//             )}
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </>
//   )
// }
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import '../../styles/animations.css'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import OrderSummary from '@/components/checkout/OrderSummary'
import PaymentForm from '@/components/checkout/PaymentForm'
import ConfirmationView from '@/components/checkout/ConfirmationView'
import useCheckout from '../../../hooks/useCheckout'

export default function CheckoutPage() {
  const router = useRouter()
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

  // Redirect to /shop if we’re on summary but have no order
  useEffect(() => {
    if (!router.isReady) return
    if (
      currentStep === 'summary' &&
      !loading &&
      !error &&
      !order
    ) {
      router.replace('/shop')
    }
  }, [router.isReady, currentStep, loading, error, order, router])

  const stepIndex = { summary: 1, payment: 2, confirmation: 3 }[currentStep]

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-100 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((n) => (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stepIndex >= n
                          ? 'bg-amber-900 text-white'
                          : 'bg-gray-200 text-stone-700'
                      }`}
                    >
                      {n}
                    </div>
                    <span className="text-sm mt-1 font-medium text-stone-900">
                      {n === 1
                        ? 'Summary'
                        : n === 2
                        ? 'Payment'
                        : 'Confirmation'}
                    </span>
                  </div>
                  {n < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors duration-200 ${
                        stepIndex > n ? 'bg-amber-700' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            {currentStep === 'summary' && loading && (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
              </div>
            )}
            {currentStep === 'summary' && error && (
              <div className="text-red-500 text-center py-8">{error}</div>
            )}
            {currentStep === 'summary' && order && (
              <OrderSummary order={order} onNext={nextStep} />
            )}

            {currentStep === 'payment' && order && (
              <PaymentForm
                paymentDetails={paymentDetails}
                onChange={handlePaymentChange}
                onBack={prevStep}
                onSubmit={submitPayment}
                isValid={isPaymentValid()}
                isLoading={loading}
              />
            )}

            {currentStep === 'confirmation' && order && (
              <ConfirmationView order={order} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
