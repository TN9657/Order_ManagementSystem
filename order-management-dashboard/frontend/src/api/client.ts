import axios from 'axios';
import {
  Customer,
  CustomerSummary,
  Order,
  OrderDetail,
  PaginatedResponse,
  CreateOrderRequest,
  CreateCustomerRequest,
  UpdateOrderStatusRequest,
  DashboardSummary,
} from '@/types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ordersApi = {
  list: async (
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    status?: string,
    sortBy: string = 'created_at',
    sortOrder: string = 'desc'
  ): Promise<PaginatedResponse<OrderDetail>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    params.append('sort_by', sortBy);
    params.append('sort_order', sortOrder);

    const response = await apiClient.get(`/orders?${params.toString()}`);
    return response.data;
  },

  get: async (id: number): Promise<OrderDetail> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  updateStatus: async (
    id: number,
    data: UpdateOrderStatusRequest
  ): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${id}/status`, data);
    return response.data;
  },

  cancel: async (id: number): Promise<Order> => {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    return response.data;
  },
};

export const customersApi = {
  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  list: async (
    page: number = 1,
    pageSize: number = 20,
    search?: string
  ): Promise<PaginatedResponse<CustomerSummary>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const response = await apiClient.get(`/customers?${params.toString()}`);
    return response.data;
  },

  get: async (id: number): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  getSummary: async (id: number): Promise<CustomerSummary> => {
    const response = await apiClient.get(`/customers/${id}/summary`);
    return response.data;
  },
};

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  },
};

export default apiClient;
