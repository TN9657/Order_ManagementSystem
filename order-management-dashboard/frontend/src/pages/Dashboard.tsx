import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardSummary, useOrders } from '@/hooks/useApi';
import { MainLayout } from '@/layouts/MainLayout';
import { Loading, Error, EmptyState } from '@/components/UI';
import { DashboardCards } from '@/components/DashboardCards';
import { DashboardCharts } from '@/components/DashboardCharts';
import { OrderTable } from '@/components/OrderTable';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { data: summary, isLoading: summaryLoading, error: summaryError } =
    useDashboardSummary();
  const { data: recentOrders, isLoading: ordersLoading, error: ordersError } =
    useOrders(1, 5);

  React.useEffect(() => {
    if (summary) setLastUpdated(new Date());
  }, [summary]);

  if (summaryLoading) return <MainLayout><Loading /></MainLayout>;
  if (summaryError)
    return (
      <MainLayout>
        <Error message="Failed to load dashboard" />
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Overview</p>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            Updated at {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {summary && <DashboardCards summary={summary} />}
        {summary && <DashboardCharts summary={summary} />}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Activity</p>
              <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              View all orders
            </button>
          </div>

          {ordersLoading ? (
            <Loading />
          ) : ordersError ? (
            <Error message="Failed to load orders" />
          ) : recentOrders && recentOrders.items.length > 0 ? (
            <OrderTable
              orders={recentOrders.items}
              onViewOrder={(orderId) => navigate(`/orders/${orderId}`)}
            />
          ) : (
            <EmptyState title="No Orders" message="No orders found" />
          )}
        </div>
      </div>
    </MainLayout>
  );
};
