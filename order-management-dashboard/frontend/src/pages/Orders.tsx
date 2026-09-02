import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useCustomers, useCreateOrder } from '@/hooks/useApi';
import { MainLayout } from '@/layouts/MainLayout';
import { Loading, Error, EmptyState, Pagination } from '@/components/UI';
import { OrderTable } from '@/components/OrderTable';

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customersList, setCustomersList] = useState<any[]>([]);

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading, error: ordersError, refetch } = useOrders(
    page,
    pageSize,
    search || undefined,
    status || undefined,
    sortBy,
    sortOrder
  );

  // Fetch customers for create modal.
  // Backend caps page_size at 100, so requesting a larger value will fail validation.
  const { data: customersData } = useCustomers(1, 100);

  useEffect(() => {
    setCustomersList(customersData?.items ?? []);
  }, [customersData]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Orders</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create Order
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by customer name or email"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(':');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="created_at:desc">Newest First</option>
              <option value="created_at:asc">Oldest First</option>
              <option value="amount:asc">Amount: Low to High</option>
              <option value="amount:desc">Amount: High to Low</option>
            </select>
          </div>
        </div>

        {ordersLoading ? (
          <Loading />
        ) : ordersError ? (
          <Error message="Failed to load orders" onRetry={() => refetch()} />
        ) : ordersData && ordersData.items.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <OrderTable
                orders={ordersData.items}
                onViewOrder={(orderId) => navigate(`/orders/${orderId}`)}
              />
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={ordersData.total}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState
            title="No Orders Found"
            message="Try changing your search or filter criteria"
          />
        )}

        {/* Create Order Modal */}
        {showCreateModal && (
          <CreateOrderModal
            customers={customersList}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

interface CreateOrderModalProps {
  customers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  customers,
  onClose,
  onSuccess,
}) => {
  const createOrder = useCreateOrder();
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !amount || !description.trim()) return;

    setIsLoading(true);
    try {
      await createOrder.mutateAsync({
        customer_id: parseInt(customerId),
        amount: parseFloat(amount),
        description: description.trim(),
        status: 'pending',
      });
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Create Order</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              disabled={customers.length === 0}
              className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {customers.length === 0 ? 'No customers available' : 'Select a customer'}
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="0.00"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
              placeholder="Add order description"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !customerId || !amount || !description.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
