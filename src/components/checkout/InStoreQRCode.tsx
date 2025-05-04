// components/checkout/InStoreQRCode.tsx
import React, { useEffect, useState } from "react"
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from "../../../utils/formatter"

interface InStoreQRCodeProps {
  orderId: string
  onComplete: () => void
}

const POLL_INTERVAL = 3000

export default function InStoreQRCode({ orderId, onComplete }: InStoreQRCodeProps) {
  const [status, setStatus] = useState<"pending"|"completed"|"cancelled">("pending")
  const [total, setTotal] = useState<number>(0)

  // build the URL staff will be directed to when they scan
  const staffUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/staff/orders/${orderId}`

  // poll for order status
  useEffect(() => {
    let timer: NodeJS.Timeout
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        const data = await res.json()
        if (data.success) {
          setStatus(data.order.status)
          setTotal(data.order.total_amount)
          if (data.order.status === "completed") {
            onComplete()
            return
          }
        }
      } catch (e) {
        console.error(e)
      }
      timer = setTimeout(checkStatus, POLL_INTERVAL)
    }
    checkStatus()
    return () => clearTimeout(timer)
  }, [orderId, onComplete])

  return (
    <div className="w-full text-center animate-fadeIn space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Scan to Pay In‑Store</h2>
      <p className="text-gray-600">Show this QR code to a staff member to complete your purchase.</p>
      <div className="inline-block bg-white p-4 rounded-lg shadow">
        <QRCodeSVG value={staffUrl} size={192} />
      </div>
      <p className="text-gray-800">
        Order total: <span className="font-medium">{formatCurrency(total)}</span>
      </p>
      <p className="text-sm text-gray-500">
        Status:{" "}
        <span className={status === "pending" ? "text-amber-600" : "text-green-600"}>
          {status}
        </span>
      </p>
    </div>
  )
}
