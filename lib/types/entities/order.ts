export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderCustomer {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'IN_PROGRESS'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'VISA' | 'CLIQ' | 'GOLD_COINS';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  pointsUsed: number;
  pointsEarned: number;
  promoDiscount: number;
  quantityDiscount: number;
  cutleryType?: 'WOOD' | 'PLASTIC' | 'NONE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  location?: {
    id: string;
    nickname: string;
    latitude: number;
    longitude: number;
  };
}

export type OrderListItem = Omit<Order, 'items'> & {
  itemCount: number;
};
