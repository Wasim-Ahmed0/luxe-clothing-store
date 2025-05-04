import { useEffect, useState } from "react"

interface OrderItem {
  variant_id: string
  quantity: number
  price_at_purchase: number
  name?: string 
}

interface Order {
  order_id: string
  created_at: string
  total_amount: number
  order_status: string
  details: OrderItem[]
}

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/orders")
        const j = await res.json()
        if (!j.success) return

        // For each order, fetch names for all its items
        const enriched: Order[] = await Promise.all(
          j.orders.map(async (order: Order) => {
            const withNames = await Promise.all(
              order.details.map(async (item) => {
                let name = item.variant_id
                try {
                  const pr = await fetch(
                    `/api/products?variantID=${item.variant_id}`
                  )
                  const pj = await pr.json()
                  if (pj.success) {
                    name = pj.product.name
                  }
                } catch {
                  // swallow
                }
                return { ...item, name }
              })
            )
            return { ...order, details: withNames }
          })
        )

        setOrders(enriched)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>Loading your orders…</p>
  if (!orders.length)
    return (
      <p className="text-gray-600">You haven’t placed any orders yet.</p>
    )

  return (
    <ul className="space-y-6">
      {orders.map((o) => (
        <li
          key={o.order_id}
          className="p-6 border rounded-lg hover:shadow transition-shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="font-semibold text-stone-400">Order #{o.order_id}</span>
              <span className="ml-2 text-sm text-stone-300">
                {new Date(o.created_at).toLocaleDateString()}
              </span>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded ${
                o.order_status === "completed"
                  ? "bg-green-100 text-green-800"
                  : o.order_status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {o.order_status}
            </span>
          </div>

          <div className="space-y-2">
            {o.details.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm font-medium text-stone-900"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>£{item.price_at_purchase.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-4 flex justify-between text-base font-medium">
            <span className="text-stone-900">Total:</span>
            <span className="text-stone-900">£{o.total_amount.toFixed(2)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
