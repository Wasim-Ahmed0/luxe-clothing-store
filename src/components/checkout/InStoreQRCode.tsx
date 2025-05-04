import React, { useEffect } from 'react'
import { QrCode } from 'lucide-react'
import QRCodeDisplay from './QRCodeDisplay'

interface InStoreQRCodeProps {
  orderId: string
  onComplete: () => void
}

const InStoreQRCode: React.FC<InStoreQRCodeProps> = ({ orderId, onComplete }) => {
  // poll status every 5s
  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`)
        const data = await res.json()
        if (res.ok && data.success && data.status === 'completed') {
          clearInterval(iv)
          onComplete()
        }
      } catch {
        // ignore
      }
    }, 5000)
    return () => clearInterval(iv)
  }, [orderId, onComplete])

  return (
    <div className="w-full animate-fadeIn text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Scan this QR code at the checkout counter
      </h2>
      <div className="flex justify-center">
        <QRCodeDisplay orderId={orderId} />
      </div>
      <p className="mt-4 text-gray-600 text-sm">
        Once your order is processed, this screen will automatically update.
      </p>
    </div>
  )
}

export default InStoreQRCode
