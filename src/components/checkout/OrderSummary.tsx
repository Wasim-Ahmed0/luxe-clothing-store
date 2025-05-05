import React from 'react'
import { Order } from '../../../types/checkout'
import { formatCurrency } from '../../../utils/formatter'
import productImages from '@/lib/product-images'
import Image from 'next/image'

interface OrderSummaryProps {
  order: Order
  onNext: () => void
  nextLabel?: string
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  onNext,
  nextLabel = 'Continue to Payment',
}) => {
  return (
    <div className="w-full animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
      
      <div className="border rounded-md overflow-hidden mb-6">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-medium text-gray-700">Items in your order</h3>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li key={item.variant_id} className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                <Image
                  src={productImages[item.name]}
                  alt={item.name}
                  fill
                  className='object-cover'
                />
              </div>
              
              <div className="flex-grow">
                <h4 className="font-medium text-gray-800">{item.name}</h4>
                
                <p className="text-sm text-gray-500">
                  Size: {item.size}
                  {item.color && item.color !== 'Default' ? ` • ${item.color}` : ''}
                </p>
                
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                  <span className="font-medium text-stone-900">
                    {formatCurrency(item.price_at_purchase * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-stone-900">{formatCurrency(order.total_amount)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-stone-900">Free</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-stone-900">
            {formatCurrency(order.total_amount * 0.08)}
          </span>
        </div>
        <div className="border-t border-gray-300 my-2" />
        <div className="flex justify-between font-semibold text-lg text-stone-900">
          <span>Total</span>
          <span>{formatCurrency(order.total_amount * 1.08)}</span>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 cursor-pointer"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

export default OrderSummary
