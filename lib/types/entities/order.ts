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

export interface Order {
  id: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderListItem = Omit<Order, 'items'> & {
  itemCount: number;
};
