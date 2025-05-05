import React, { useState } from 'react';
import { PaymentDetails } from '../../../types/checkout';
import { CreditCard, ArrowLeft } from 'lucide-react';

interface PaymentFormProps {
  paymentDetails: PaymentDetails;
  onChange: (field: keyof PaymentDetails, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isValid: boolean;
  isLoading: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentDetails,
  onChange,
  onSubmit,
  onBack,
  isValid,
  isLoading
}) => {
  const [focused, setFocused] = useState<keyof PaymentDetails | null>(null);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.match(/.{1,4}/g)?.join(' ') ?? value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length > 2) return `${v.slice(0,2)}/${v.slice(2,4)}`;
    return v;
  };

  return (
    <div className="w-full animate-fadeIn">
      <button 
        onClick={onBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to order summary
      </button>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Details</h2>
      
      <div className="mb-8">
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mb-6">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="font-medium text-gray-700">Credit / Debit Card</h3>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="cardNumber" className="block text-sm font-medium text-stone-700">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={e => onChange('cardNumber', formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              onFocus={() => setFocused('cardNumber')}
              onBlur={() => setFocused(null)}
              className={`w-full p-3 border rounded-md outline-none transition-all duration-200 text-stone-900 placeholder-stone-300 ${
                focused === 'cardNumber' ? 'border-gray-500 ring-1 ring-gray-500' : 'border-gray-300'
              }`}
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="cardHolder" className="block text-sm font-medium text-stone-700">
              Cardholder Name
            </label>
            <input
              type="text"
              id="cardHolder"
              value={paymentDetails.cardHolder}
              onChange={e => onChange('cardHolder', e.target.value)}
              placeholder="Jane Doe"
              onFocus={() => setFocused('cardHolder')}
              onBlur={() => setFocused(null)}
              className={`w-full p-3 border rounded-md outline-none transition-all duration-200 text-stone-900 placeholder-stone-300 ${
                focused === 'cardHolder' ? 'border-gray-500 ring-1 ring-gray-500' : 'border-gray-300'
              }`}
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="space-y-1 flex-1">
              <label htmlFor="expiryDate" className="block text-sm font-medium text-stone-700">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                value={paymentDetails.expiryDate}
                onChange={e => onChange('expiryDate', formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                onFocus={() => setFocused('expiryDate')}
                onBlur={() => setFocused(null)}
                className={`w-full p-3 border rounded-md outline-none transition-all duration-200 text-stone-900 placeholder-stone-300 ${
                  focused === 'expiryDate' ? 'border-gray-500 ring-1 ring-gray-500' : 'border-gray-300'
                }`}
              />
            </div>
            
            <div className="space-y-1 w-24">
              <label htmlFor="cvv" className="block text-sm font-medium text-stone-700">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={paymentDetails.cvv}
                onChange={e => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0,3))}
                placeholder="123"
                maxLength={3}
                onFocus={() => setFocused('cvv')}
                onBlur={() => setFocused(null)}
                className={`w-full p-3 border rounded-md outline-none transition-all duration-200 text-stone-900 placeholder-stone-300 ${
                  focused === 'cvv' ? 'border-gray-500 ring-1 ring-gray-500' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          className={`${
            isValid
              ? 'bg-gray-900 hover:bg-gray-800 cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed'
          } text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 flex items-center justify-center min-w-[128px]`}
          onClick={onSubmit}
          disabled={!isValid || isLoading}
        >
          {isLoading && (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
          )}
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
