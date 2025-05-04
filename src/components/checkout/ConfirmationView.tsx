// // components/checkout/ConfirmationView.tsx
// import React from 'react';
// import { Order } from '../../../types/checkout';
// import { formatCurrency, formatDate } from '../../../utils/formatter';
// import { CheckCircle2 } from 'lucide-react';
// import QRCodeDisplay from './QRCodeDisplay';

// interface ConfirmationViewProps {
//   order: Order;
// }

// const ConfirmationView: React.FC<ConfirmationViewProps> = ({ order }) => {
//   return (
//     <div className="w-full animate-fadeIn text-center">
//       <div className="mb-6 flex flex-col items-center">
//         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
//           <CheckCircle2 className="w-10 h-10 text-green-600" />
//         </div>
//         <h2 className="text-2xl font-semibold text-gray-800">Payment Successful</h2>
//         <p className="text-gray-600 mt-1">
//           Thank you for your purchase. Your order has been confirmed.
//         </p>
//       </div>
      
//       <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
//         <div className="mb-4">
//           <h3 className="font-bold text-lg text-stone-800 mb-1">Order Details</h3>
//           <p className="text-sm text-stone-600">Order #{order.order_id.slice(0,8)}</p>
//           <p className="text-sm text-stone-600">
//             Date: {formatDate(order.created_at)}
//           </p>
//         </div>
        
//         <div className="mb-4">
//           <h3 className="font-semibold text-stone-800 mb-1">Total</h3>
//           <p className="text-xl text-stone-900 font-semibold">{formatCurrency(order.total_amount * 1.08)}</p>
//         </div>
//       </div>
      
//       <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
//         <QRCodeDisplay orderId={order.order_id} />
        
//         <div className="text-left bg-gray-50 rounded-lg p-6 border border-gray-200">
//           <h3 className="font-medium text-gray-800 mb-1">Delivery Information</h3>
//           <p className="text-sm text-gray-600">
//             Your order will be ready for pickup or delivery within 2–3 business days.
//           </p>
//         </div>
//       </div>
      
//       <div className="flex flex-col items-center space-y-2">
//         <button
//           className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 cursor-pointer"
//           onClick={() => window.location.href = '/'}
//         >
//           Continue Shopping
//         </button>
//         <button
//           className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm cursor-pointer"
//           onClick={() => window.print()}
//         >
//           Print Receipt
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ConfirmationView;


import React, { useEffect } from 'react'
import { Order } from '../../../types/checkout'
import { formatCurrency, formatDate } from '../../../utils/formatter'
import { CheckCircle2 } from 'lucide-react'

interface ConfirmationViewProps {
  order: Order
}

const ConfirmationView: React.FC<ConfirmationViewProps> = ({ order }) => {
  useEffect(() => {
    // clear out residual cookies
    document.cookie = 'cart_id=; path=/; max-age=0'
    document.cookie = 'store_id=; path=/; max-age=0'
  }, []);
  
  return (
    <div className="w-full animate-fadeIn text-center">
      <div className="mb-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Order Successful</h2>
        <p className="text-gray-600 mt-1">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        <div className="mb-4">
          <h3 className="font-semibold text-stone-900 mb-1">Order Details</h3>
          <p className="text-sm text-gray-600">
            Order #{order.order_id.substring(0, 8)}
          </p>
          <p className="text-sm text-gray-600">
            Date: {formatDate(order.created_at)}
          </p>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-stone-900 mb-1">Total</h3>
          <p className="text-xl font-semibold text-stone-900">
            {formatCurrency(order.total_amount * 1.08)}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <button
          className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 mb-2 cursor-pointer"
          onClick={() => (window.location.href = '/')}
        >
          Continue Shopping
        </button>
        <button
          className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm cursor-pointer"
          onClick={() => window.print()}
        >
          Print Receipt
        </button>
      </div>
    </div>
  )
}

export default ConfirmationView
