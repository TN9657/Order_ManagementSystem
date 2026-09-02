import React from 'react';
import { DashboardSummary } from '@/types';
import { formatCurrency } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  bgColor?: string;
  accent?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor = 'bg-blue-50',
  accent = 'text-blue-600',
  subtitle,
}) => {
  return (
    <div className={`${bgColor} rounded-2xl border border-slate-200 p-5 shadow-sm transition-transform hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className={`mt-2 text-xs font-medium ${accent}`}>{subtitle}</p>}
        </div>
        {icon && <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 text-2xl ${accent}`}>{icon}</div>}
      </div>
    </div>
  );
};

interface DashboardCardsProps {
  summary: DashboardSummary;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Orders"
        value={summary.total_orders}
        bgColor="bg-blue-50"
        accent="text-blue-600"
        subtitle="Across all customers"
        icon="📦"
      />
      <StatCard
        title="Customers"
        value={summary.total_customers}
        bgColor="bg-emerald-50"
        accent="text-emerald-600"
        subtitle="Active profiles"
        icon="👥"
      />
      <StatCard
        title="Completed Value"
        value={formatCurrency(summary.total_completed_value)}
        bgColor="bg-violet-50"
        accent="text-violet-600"
        subtitle="Successful sales"
        icon="💰"
      />
      <StatCard
        title="Avg. Order"
        value={formatCurrency(summary.average_order_value)}
        bgColor="bg-amber-50"
        accent="text-amber-600"
        subtitle="Per transaction"
        icon="📊"
      />
      <StatCard
        title="Pending"
        value={summary.pending_orders}
        bgColor="bg-yellow-50"
        accent="text-yellow-600"
        subtitle="Awaiting action"
        icon="⏳"
      />
      <StatCard
        title="Completed"
        value={summary.completed_orders}
        bgColor="bg-green-50"
        accent="text-green-600"
        subtitle="Closed successfully"
        icon="✅"
      />
      <StatCard
        title="Cancelled"
        value={summary.cancelled_orders}
        bgColor="bg-red-50"
        accent="text-red-600"
        subtitle="Need review"
        icon="❌"
      />
    </div>
  );
};
