// components/checkout/QRCodeDisplay.tsx
import React from 'react';
import { QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  orderId: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ orderId }) => {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Scan to verify purchase</h3>
      <div className="w-32 h-32 bg-white p-2 flex items-center justify-center rounded-md border border-gray-200">
        {/* replace with real QR code generator later */}
        <QrCode className="w-full h-full text-gray-800" />
      </div>
      <p className="mt-2 text-xs text-gray-500">Order ID: {orderId.slice(0, 8)}…</p>
    </div>
  );
};

export default QRCodeDisplay;
