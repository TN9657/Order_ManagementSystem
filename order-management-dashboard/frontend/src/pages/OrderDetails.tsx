import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrder, useUpdateOrderStatus, useCancelOrder } from '@/hooks/useApi';
import { MainLayout } from '@/layouts/MainLayout';
import { Loading, Error } from '@/components/UI';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/utils';

export const OrderDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id) : 0;

  const { data: order, isLoading, error } = useOrder(orderId);
  const updateStatusMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    await updateStatusMutation.mutateAsync({
      id: orderId,
      data: { status: selectedStatus as any },
    });
    setShowStatusModal(false);
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(orderId);
    setShowCancelModal(false);
  };

  if (isLoading) return <MainLayout><Loading /></MainLayout>;
  if (error)
    return (
      <MainLayout>
        <Error message="Failed to load order" />
      </MainLayout>
    );
  if (!order) return <MainLayout><Error message="Order not found" /></MainLayout>;

  const canCancel = order.status === 'pending';
  const canUpdateStatus = order.status === 'pending';

  return (
    <MainLayout>
      <div>
        <button
          onClick={() => navigate('/orders')}
          className="text-blue-600 hover:text-blue-900 mb-4"
        >
          ← Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Name</dt>
                  <dd className="text-lg text-gray-900">{order.customer_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Email</dt>
                  <dd className="text-lg text-gray-900">{order.customer_email}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Details
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Amount</dt>
                  <dd className="text-lg font-bold text-gray-900">
                    {formatCurrency(order.amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Status</dt>
                  <dd className="text-lg">
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Description</dt>
                  <dd className="mt-1 rounded border border-gray-200 bg-gray-50 p-3 text-base text-gray-900 whitespace-pre-wrap">
                    {order.description?.trim() || 'No description provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Created</dt>
                  <dd className="text-lg text-gray-900">
                    {formatDate(order.created_at)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            {canUpdateStatus && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Update Status
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Update Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Cancel Order
              </h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to cancel Order #{order.id}?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
