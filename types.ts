export interface Product {
  id: string;
  name: string;
  price: number; 
  originalPrice: number; 
  discountPercentage: number; 
  currency: string;
  category: string;
  description: string;
  images: string[];
  stock: boolean;
  features: string[];
  colors?: string[]; 
  deliveryCharges: number; 
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

export interface OrderDetails {
  customerName: string;
  customerEmail: string; // Added for detailed logging
  phoneNumber: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  orderId: string;
  timestamp: number;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  customerDetails: OrderDetails;
  orderTxtSummary?: string; // This stores the "TXT file" representation of the order
}

export interface Address {
  id: string;
  tag: 'Home' | 'Office' | 'Other';
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}
