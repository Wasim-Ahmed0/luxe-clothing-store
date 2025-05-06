import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Order, OrderStatus } from '@/generated/prisma'

interface Props {
  storeId: string
}

export default function OrderCheckout({ storeId }: Props) {
  const [searchOrderId, setSearchOrderId] = useState('')
  const [orderDetails, setOrderDetails] = useState<Order | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending')
  const [updating, setUpdating] = useState(false)

  const handleSearchOrder = async () => {
    if (!searchOrderId.trim()) return alert('Please enter an Order ID')
    
    // fetch order 
    const res = await fetch(`/api/orders/${searchOrderId}`)
    const data = await res.json()
    if (!res.ok || !data.order) {
      return alert('Order not found')
    }
    // open modal
    setOrderDetails(data.order)
    setSelectedStatus(data.order.order_status)
    setModalOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!orderDetails) return
    setUpdating(true)
    // Update order status
    const res = await fetch(`/api/orders/${orderDetails.order_id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: selectedStatus,
        store_id: storeId,
      }),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      alert(`Order ${json.order_id} updated to ${json.status}!`)
      setOrderDetails(null)
      setSearchOrderId('')
      setModalOpen(false)
    } else {
      alert(json.error || 'Failed to update order')
    }
    setUpdating(false)
  }

  return (
    <div className="mt-6 bg-white shadow p-6 rounded">
      <h2 className="text-xl font-semibold mb-4 text-stone-900">Simulate QR Scan</h2>
      <div className="flex gap-2">
        <Input
          placeholder="Enter Order ID"
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
          className='text-stone-700'
        />
        <Button onClick={handleSearchOrder} className='cursor-pointer'>Search</Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-stone-900">Order Details</DialogTitle>
          </DialogHeader>

          {orderDetails && (
            <div className="space-y-3 py-2 text-stone-900">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Order ID:</span>
                <span className="font-mono text-sm">{orderDetails.order_id}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span>£{orderDetails.total_amount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Placed On:</span>
                <span>{new Date(orderDetails.created_at).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Update Status:</span>
                <select
                  className="border rounded px-3 py-1"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                >
                  <option value="pending" disabled>
                    Pending
                  </option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating || orderDetails?.order_status === selectedStatus}
              className='font-medium cursor-pointer'
            >
              Update Order Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
