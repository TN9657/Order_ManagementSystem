import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomer, useOrders } from '@/hooks/useApi';
import { MainLayout } from '@/layouts/MainLayout';
import { Loading, Error, EmptyState, Pagination } from '@/components/UI';
import { OrderTable } from '@/components/OrderTable';
import { formatCurrency, formatDate } from '@/utils';

export const CustomerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const customerId = id ? parseInt(id) : 0;
  const [ordersPage, setOrdersPage] = useState(1);
  const [pageSize] = useState(10);

  const { data: customer, isLoading, error } = useCustomer(customerId);
  const { data: ordersData, isLoading: ordersLoading } = useOrders(
    ordersPage,
    pageSize
  );

  if (isLoading) return <MainLayout><Loading /></MainLayout>;
  if (error)
    return (
      <MainLayout>
        <Error message="Failed to load customer" />
      </MainLayout>
    );
  if (!customer)
    return (
      <MainLayout>
        <Error message="Customer not found" />
      </MainLayout>
    );

  // Filter orders for this customer
  const customerOrders = ordersData?.items.filter(
    (o) => o.customer_id === customerId
  ) || [];

  return (
    <MainLayout>
      <div>
        <button
          onClick={() => navigate('/customers')}
          className="text-blue-600 hover:text-blue-900 mb-4"
        >
          ← Back to Customers
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {customer.name}
              </h1>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Email</dt>
                  <dd className="text-lg text-gray-900">{customer.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Member Since</dt>
                  <dd className="text-lg text-gray-900">
                    {formatDate(customer.created_at)}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">
                    Completed Orders
                  </dt>
                  <dd className="text-lg font-bold text-gray-900">
                    {customer.completed_orders_count}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">
                    Total Completed Value
                  </dt>
                  <dd className="text-lg font-bold text-green-600">
                    {formatCurrency(customer.completed_orders_value)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order History</h2>
          {ordersLoading ? (
            <Loading />
          ) : customerOrders.length > 0 ? (
            <>
              <OrderTable
                orders={customerOrders}
                onViewOrder={(orderId) => navigate(`/orders/${orderId}`)}
              />
              <Pagination
                page={ordersPage}
                pageSize={pageSize}
                total={customerOrders.length}
                onPageChange={setOrdersPage}
              />
            </>
          ) : (
            <EmptyState
              title="No Orders"
              message="This customer has no orders yet"
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};
