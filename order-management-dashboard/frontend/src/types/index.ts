export interface Customer {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerSummary extends Customer {
  completed_orders_count: number;
  completed_orders_value: number;
}

export interface Order {
  id: number;
  customer_id: number;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  customer_name: string;
  customer_email: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface MonthlyStatItem {
  month: string;
  amount_received: number;
  order_count: number;
}

export interface DashboardSummary {
  total_orders: number;
  total_customers: number;
  total_completed_value: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_order_value: number;
  monthly_stats: MonthlyStatItem[];
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
}

export interface CreateOrderRequest {
  customer_id: number;
  amount: number;
  description: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'completed' | 'cancelled';
}
