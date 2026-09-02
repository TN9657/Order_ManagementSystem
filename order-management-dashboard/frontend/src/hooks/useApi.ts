import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, customersApi, dashboardApi } from '@/api/client';
import { CreateOrderRequest, CreateCustomerRequest, UpdateOrderStatusRequest } from '@/types';

// Orders hooks
export const useOrders = (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  status?: string,
  sortBy: string = 'created_at',
  sortOrder: string = 'desc'
) => {
  return useQuery({
    queryKey: ['orders', page, pageSize, search, status, sortBy, sortOrder],
    queryFn: () =>
      ordersApi.list(page, pageSize, search, status, sortBy, sortOrder),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderStatusRequest }) =>
      ordersApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Customers hooks
export const useCustomers = (page: number = 1, pageSize: number = 20, search?: string) => {
  return useQuery({
    queryKey: ['customers', page, pageSize, search || ''],
    queryFn: () => customersApi.list(page, pageSize, search),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustomerSummary = (id: number) => {
  return useQuery({
    queryKey: ['customerSummary', id],
    queryFn: () => customersApi.getSummary(id),
    staleTime: 5 * 60 * 1000,
  });
};

// Dashboard hooks
export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 0,
    refetchInterval: 30 * 1000,
  });
};
