// types/checkout.ts

export interface OrderItem {
    variant_id: string;
    image: string;
    name: string;
    color: string;
    size: string;
    quantity: number;
    price_at_purchase: number;
  }
  
  export interface ApiOrderDetail {
    variant_id:        string;
    quantity:           number;
    price_at_purchase:  number;
  }
  
  export interface Order {
    order_id: string;
    created_at: string;       // ISO timestamp
    total_amount: number;     // subtotal before tax/shipping
    items: OrderItem[];
  }
  
  export interface PaymentDetails {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;       // MM/YY
    cvv: string;
  }
  